# AI Personal Tutor Agent 🏛️

An interactive, full-stack, AI-powered personal tutor that designs personalized learning roadmaps, conducts Socratic dialogue, creates custom assessments, and generates active-recall flashcards for any subject.

This application is powered by the **Gemini 3.5 Flash** model and uses a secure full-stack architecture (Express + Vite + React + TypeScript) to protect API credentials.

---

## 🚀 Why GitHub Pages Shows the README (and how to run it)

**GitHub Pages is a static file hosting service.** It does not support running full-stack applications with Node.js backends or executing dynamic server-side logic (like our secure Express API proxy that communicates with the Gemini API).

Because this app uses a full-stack architecture to keep the **Gemini API Key** secure, **it cannot be hosted on GitHub Pages**. 

To run this application, you have two options:

### Option 1: Live Preview (Hosted on Cloud Run)
You can access your live development applet hosted securely on Google Cloud Run via Google AI Studio's deployment. This includes fully-functional API responses and database sessions!

### Option 2: Run Locally (Recommended for Development)
To run the full-stack server on your own computer:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kaviyadevi1636/AI-Personal-Tutor-Agent.git
   cd AI-Personal-Tutor-Agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/)):
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Launch Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000) to start learning!

---

## 🧠 Features

- 🗺️ **Syllabus Architect**: Provide any study topic (e.g., *"Quantum Mechanics basics"* or *"Modern React with TS"*) and receive a structured, multi-module learning syllabus tailored to your level.
- 🏛️ **Socratic Chat Dialogue**: Engage in deep inquiry with custom tutor personas (Socrates, Ada Lovelace, Albert Einstein, Shakespeare) that guide you via questions rather than giving direct answers.
- 🎓 **Interactive AI Lesson**: Get customized explanations designed in Socratic, ELI5, or Senior Engineer pedagogy.
- 🏆 **Dynamic Assessments**: Test your knowledge with 5 custom-constructed multiple-choice questions per topic, featuring detailed educational feedback.
- 📖 **Active Recall Flashcards**: Flashcards with flippable CSS animations and memory-grade metrics to guarantee retention.
