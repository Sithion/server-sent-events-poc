import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ServiceBusClient } from '@azure/service-bus';

export const getServerSideProps = async () => {
    return {
        props: {
            apiUrl: process.env.NOTIFICATIONS_API_URL,
            serviceBusConnectionString: process.env.AZURE_SERVICE_BUS_CONNECTION_STRING,
            queueName: process.env.AZURE_SERVICE_BUS_QUEUE_NAME,
        },
    };
};

interface NotificationStreamProps {
    apiUrl: string;
    serviceBusConnectionString: string;
    queueName: string;
}

const NotificationStream: React.FC<NotificationStreamProps> = ({ apiUrl, serviceBusConnectionString, queueName }) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string>('default');
    const [customMessage, setCustomMessage] = useState<string>('');
    const router = useRouter();
    const { type } = router.query;
    useEffect(() => {
        const urlWithQuery = type ? `${apiUrl}?type=${type}` : apiUrl;
        const eventSource = new EventSource(urlWithQuery);
        console.log('Event connection opened!');
        eventSource.onmessage = (event) => {
            console.log('Event received:', event);
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data.message || JSON.stringify(data)]);
        };

        eventSource.onerror = (err) => {
            console.error('SSE connection error:', err);
            eventSource.close();
        };

        return () => {
            console.log('Event connection closed!');
            eventSource.close();
        };
    }, []);

    const sendMessageToQueue = async () => {
        try {
            const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
            const sender = serviceBusClient.createSender(queueName);

            const message = {
                body: { type: selectedType, message: customMessage || `Message sent at ${new Date().toISOString()}`}
            };

            await sender.sendMessages(message);
            console.log('Message sent to Azure Service Bus:', message);

            await sender.close();
            await serviceBusClient.close();
        } catch (error) {
            console.error('Error sending message to Azure Service Bus:', error);
        }
    };

    return (
        <div>
            <h1>Welcome to the Frontend Application</h1>
            <p>This is the homepage of the Next.js application.</p>
            <div>
                <h3>Send a Message</h3>
                <label>
                    Select Type:
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                        <option value="">Default</option>
                        <option value="typeA">Type A</option>
                        <option value="typeB">Type B</option>
                    </select>
                </label>
                <br />
                <label>
                    Custom Message:
                    <input
                        type="text"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Enter your message"
                    />
                </label>
                <br />
                <button onClick={sendMessageToQueue}>Send Message to Queue</button>
            </div>
            <h2>Notifications</h2>
            <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationStream;