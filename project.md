# Dog Vision App

## Overview

The Dog Vision App is an interactive web application that allows users to upload images of dogs and receive information about the dog breed detected in the image. The app provides a list of the top 5 dog breeds that the AI model identifies in the uploaded image and allows users to generate a detailed description of the characteristics of the top breed.

## Features

- **Image Upload**: Users can upload an image of a dog, and the app will analyze the image to detect dog breeds.
- **Breed Detection**: The app displays the top 5 dog breeds detected in the image along with the confidence level for each breed.
- **Characteristics Generation**: Users can click on a button to generate a detailed description of the characteristics of the top dog breed detected.
- **User-Friendly Design**: The app features a clean and modern UI with transparent cards for displaying breed information and characteristics in an easy-to-read format.

## Tech Stack

- **Frontend**: The frontend of the app is built with React, utilizing functional components and hooks for state management.
- **API**: The app uses the Azure Cognitive Services for image analysis and the Azure OpenAI API to generate text descriptions of dog breeds.
- **Styling**: Tailwind CSS is used for styling the application, providing utility classes for a responsive and customizable design.
- **Deployment**: The app is designed to be deployed on Vercel, taking advantage of its serverless functions for backend operations.

## Getting Started

To run the Dog Vision App locally, follow these steps:

1. Clone the repository to your local machine.
2. Install the dependencies with `npm install`.
3. Start the development server with `npm start`.
4. Open `http://localhost:3000` in your browser to view the app.

## Contributing

Contributions to the Dog Vision App are welcome. Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
