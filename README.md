# DocumentChat

A Next.js application for chatting with your documents using AI-powered embeddings and vector search. Built with Pinecone Assistant, Supabase and Shadcn UI.

## Features

- **Document Upload**: Upload PDF and text documents via drag-and-drop interface
- **AI-Powered Chat**: Ask questions about your documents and get intelligent responses
- **Vector Search**: Fast semantic search using Pinecone vector database
- **User Authentication**: Secure authentication with Supabase
- **Responsive UI**: Modern, responsive interface built with Tailwind CSS and Radix UI

## Prerequisites

- Node.js 18+
- NPM, Yarn, pnpm, or Bun
- Supabase account
- Pinecone account

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ozy360/documentchat.git
   cd documentchat
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

## Environment Setup

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url  # Same value as SUPABASE_URL
SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key  # Same value as SUPABASE_PUBLISHABLE_OR_ANON_KEY


# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
```

### Setting up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Enable authentication in your Supabase project

### Setting up Pinecone

1. Create an account on [Pinecone](https://www.pinecone.io/product/assistant/)
2. Get your API key from the dashboard

## Running the Application

1. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Sign up/Login:**

   Create an account or log in to access the application

## Usage

1. **Upload Documents:** Use the drag-and-drop interface to upload your documents
2. **Chat with AI:** Ask questions about your uploaded documents in the chat interface
3. **Manage Documents:** View and manage your uploaded documents in the sidebar

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── protected/         # Protected application pages
├── components/            # React components
├── lib/                   # Utility libraries
│   └── supabase/          # Supabase configuration
└── public/                # Static assets
```

## Technologies Used

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Vector Database:** Pinecone
- **AI/ML:** OpenAI GPT, LangChain
- **Authentication:** Supabase Auth
- **UI Components:** Radix UI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.
