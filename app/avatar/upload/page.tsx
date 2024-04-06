'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';

export default function AvatarUploadPage() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
    const [apiResponse, setApiResponse] = useState<any>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!inputFileRef.current?.files) {
            throw new Error('No file selected');
        }

        const file = inputFileRef.current.files[0];

        // Fetch data from the API endpoint
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/octet-stream');
        myHeaders.append('Ocp-Apim-Subscription-Key', '6b8fdee82eac4149b4086911eab8300e');

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: file,
            redirect: 'follow',
        };

        const apiResponse = await fetch(
            'https://finddogbreed.cognitiveservices.azure.com/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&language=en&gender-neutral-caption=False&model-name=firstdogmodel',
            requestOptions
        );
        const data = await apiResponse.text();
        setApiResponse(JSON.parse(data));

        // Upload the data to Blob storage
        const response = await fetch(`/api/avatar/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
        });

        const newBlob = (await response.json()) as PutBlobResult;
        setBlob(newBlob);
    };

    return (
        <>
            <h1>Upload Your Avatar</h1>

            <form onSubmit={handleSubmit}>
                <input name="file" ref={inputFileRef} type="file" required />
                <button type="submit">Upload</button>
            </form>

            {blob && (
                <div>
                    Blob url: <a href={blob.url}>{blob.url}</a>
                </div>
            )}

            {apiResponse && (
                <div>
                    <h2>API Response</h2>
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
            )}
        </>
    );
}
