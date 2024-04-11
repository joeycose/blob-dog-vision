'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';

export default function DogVisionPage() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [topBreeds, setTopBreeds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCharacteristicsLoading, setIsCharacteristicsLoading] = useState(false);
    const [characteristics, setCharacteristics] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showCharacteristics, setShowCharacteristics] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setShowCharacteristics(false);
        setCharacteristics([]);

        if (!inputFileRef.current?.files) {
            throw new Error('No file selected');
        }

        const file = inputFileRef.current.files[0];

        // Fetch data from the image analysis API
        const apiResponse = await fetch(
            'https://finddogbreed.cognitiveservices.azure.com/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&language=en&gender-neutral-caption=False&model-name=firstdogmodel',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Ocp-Apim-Subscription-Key': '6b8fdee82eac4149b4086911eab8300e',
                },
                body: file,
            }
        );
        const imageAnalysisData = await apiResponse.json();

        // Determine the top 5 dog breeds
        const topBreeds = imageAnalysisData.customModelResult.tagsResult.values.slice(0, 5);
        setTopBreeds(topBreeds);

        // Upload the data to Blob storage
        const blobResponse = await fetch(`/api/avatar/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
        });
        const newBlob = (await blobResponse.json()) as PutBlobResult;
        setBlob(newBlob);

        // Create a URL for the Blob
        const blobUrl = URL.createObjectURL(file);
        setBlobUrl(blobUrl);

        setIsLoading(false);
    };

    const fetchCharacteristics = async (breedName: string) => {
        try {
            setIsCharacteristicsLoading(true);
            const response = await fetch(
                'https://dog-vision-openai.openai.azure.com/openai/deployments/Dog-Vision-OpenAI/completions?api-version=2023-09-15-preview',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': 'dcfbc7be940c4d4d8f009b5b7d08efcf',
                    },
                    body: JSON.stringify({
                        prompt: `Generate key characteristics of the ${breedName} dog breed.`,
                        max_tokens: 70,
                        temperature: 0.1,
                        frequency_penalty: 1.2,
                        presence_penalty: 0,
                        top_p: 0.5,
                        stop: ["\n"],
                    }),
                }
            );
            const data = await response.json();

            if (data.choices && data.choices.length > 0 && data.choices[0].text) {
                const characteristicsText = data.choices[0].text.trim();
                setCharacteristics(characteristicsText ? characteristicsText.split('\n') : []);
            } else {
                setError('Error fetching dog characteristics. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching dog characteristics:', error);
            setError('Error fetching dog characteristics. Please try again later.');
        } finally {
            setIsCharacteristicsLoading(false);
        }
    };

    const handleShowCharacteristics = () => {
        if (topBreeds.length > 0) {
            setShowCharacteristics(true);
            fetchCharacteristics(topBreeds[0].name);
        }
    };

    return (
        <div className="bg-gradient-to-br from-black to-[#1e3a8a] min-h-screen flex flex-col items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-500">Dog Vision</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="file" className="block font-medium text-gray-700 mb-1">
                            Upload Your Image
                        </label>
                        <input
                            id="file"
                            name="file"
                            ref={inputFileRef}
                            type="file"
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Analyze'}
                    </button>
                </form>

                {isLoading ? (
                    <div className="mt-4 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {blobUrl && (
                            <div className="mt-4">
                                <img src={blobUrl} alt="Uploaded" className="max-w-full h-auto rounded-md" />
                            </div>
                        )}

                        {topBreeds.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-xl font-bold mb-2 text-blue-500">Top 5 Dog Breeds</h2>
                                <ul className="space-y-2">
                                    {topBreeds.map((breed, index) => (
                                        <li
                                            key={index}
                                            className="bg-gray-200 rounded-md p-2 flex justify-between items-center"
                                        >
                                            <span className="font-medium text-gray-700">{breed.name}</span>
                                            <span className="text-gray-500">Confidence: {(breed.confidence * 100).toFixed(2)}%</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mt-4"
                                    onClick={handleShowCharacteristics}
                                    disabled={topBreeds.length === 0 || isCharacteristicsLoading}
                                >
                                    {isCharacteristicsLoading
                                        ? 'Loading...'
                                        : topBreeds.length > 0
                                            ? `Generate ${topBreeds[0].name} Characteristics`
                                            : 'Characteristics'}
                                </button>
                            </div>
                        )}

                        {showCharacteristics && characteristics.length > 0 && (
                            <div className="mt-4 bg-gray-200 backdrop-blur-sm rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4 text-blue-500">Characteristics</h2>
                                <div className="space-y-6 text-gray-800">
                                    {characteristics.map((characteristic, index) => (
                                        <div key={index} className="leading-relaxed">
                                            {characteristic.startsWith('•') ? (
                                                <div className="flex items-start">
                                                    <span className="mr-2 text-blue-500">•</span>
                                                    <span>{characteristic.slice(1).trim()}</span>
                                                </div>
                                            ) : (
                                                <div className="font-medium">{characteristic}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        )}

                        {error && (
                            <div className="mt-4 text-red-500 font-medium">{error}</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
