import { useRouter } from 'next/router';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ServiceBusClient } from '@azure/service-bus';
import { fetchEventSource, type FetchEventSourceInit } from '@microsoft/fetch-event-source';

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
        const controller = new AbortController();
        controller.signal.addEventListener('abort', () => {
            console.log('Abort signal received, closing connection');
        });
        const signal = controller.signal;
        const eventSourceConfig: FetchEventSourceInit = {
            signal,
            onopen: () => {
                console.log('Event connection opened!');
                return Promise.resolve();
            },
            onerror: (err) => {
                console.error('SSE connection error:', err);
            },
            onclose: () => {
                console.log('Event connection closed!');
                return controller.abort();
            },
            onmessage: (event) => {
                console.log('Event received:', event);
                if (event.id) {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, JSON.stringify(data)]);
                }
            }
        };
        // Storing the API key in the environment 
        // variable only cause it's a POC project.
        // In a real project, it should get key using openId API
        // or any other authentication method.
        if (process.env?.BACKEND_API_KEY) {
            eventSourceConfig.headers = {
                'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
            }
        }
        fetchEventSource(urlWithQuery, eventSourceConfig);
        return () => {
            controller.abort();
            console.log('Effect Destroyed, Event connection closed!');
        };
    }, [apiUrl, type]);

    const sendMessageToQueue = useCallback(async () => {
        try {
            const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
            const sender = serviceBusClient.createSender(queueName);

            const message = {
                body: { type: selectedType, message: customMessage || `Message sent at ${new Date().toISOString()}` }
            };

            await sender.sendMessages(message);
            console.log('Message sent to Azure Service Bus:', message);

            await sender.close();
            await serviceBusClient.close();
        } catch (error) {
            console.error('Error sending message to Azure Service Bus:', error);
        }
    }, [serviceBusConnectionString, queueName]);

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
                <button type="button" onClick={sendMessageToQueue}>Send Message to Queue</button>
            </div>
            <h2>Notifications</h2>
            <ul>
                {messages.map((msg, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: POC
                    <li key={idx}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationStream;