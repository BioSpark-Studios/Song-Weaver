# Song Weaver - User Guide

Welcome to Song Weaver! This guide will walk you through the entire application, from crafting AI music prompts to creating and exporting a professional artist promo kit.

## 1. Navigation

The application is divided into several main pages, accessible from the navigation bar in the header:

- **Song Weaver**: The primary tool for visually building prompts for AI music generation.
- **Artist Bio**: A dedicated editor to create and export a professional artist biography.
- **Albums**: A page to create album showcases with a built-in music player.
- **Settings**: A central place to configure application-wide settings like your API key, branding, and appearance.

In the top right, you will also find buttons for **Export Promo Kit** and **Settings**.

### Export Promo Kit
Click the package icon at any time to download a `promo-kit.md` file. This single file contains all your current data: your settings, your full Song Weaver project, your Artist Bio, and your Album data, formatted for portability.

---

## 2. Song Weaver Page

This is your main workspace for creating AI music prompts.

### Interface & Project Management
- **Sidebar (Left)**: Your palette of building blocks. Click on any block type to add it to the editor.
- **Prompt Editor (Center)**: Your canvas. Arrange and configure blocks here. Drag blocks to reorder them.
- **Output Panel (Right)**:
    - **Generated Prompt**: A live preview of your final prompt text.
    - **Project**: Icon buttons to create a **New** project, **Save** your layout to a `.songweaver` file, **Open** a saved file, or **Clear** the editor.
    - **Export Prompt**: Buttons to export the generated prompt text as a `.md` or `.pdf` file.

---

## 3. Artist Bio Page

Create a clean, professional, single-page bio.

### Interface
- **Sidebar (Left)**: Add content blocks for your bio.
- **Editor (Center)**: Arrange and edit your bio blocks.
- **Preview Panel (Right)**: See a live preview of your bio page. At the top of this panel, you'll find export buttons.

### Bio Block Types
- **Header**: Your main artist name and an optional tagline.
- **Image**: Upload a promotional photo.
- **Text Block**: Write your biography or any other descriptive text.
- **Links**: Add a list of links to your social media, streaming services, and online stores.

---

## 4. Albums Page

Create and showcase your albums with a built-in interactive player.

### Interface
- **Sidebar (Left)**: Add `Album Header` and `Tracklist` blocks.
- **Editor (Center)**: Arrange and configure your album blocks.
- **Preview Panel (Right)**: A fully functional music player that previews your album.

### Album Block Types
- **Album Header**: Set the Album Title, Artist Name, and upload a cover art image directly from your computer.
- **Tracklist**: Build your album's song list. For each track, add a title and either paste a URL or click "Upload" to select a local `.mp3` or `.mp4` file.

**Note on Uploaded Files**: Files you upload are loaded into the browser for in-app playback during your current session. They are not stored permanently online. For distribution, manage your media files alongside your exported project data.

---

## 5. Settings Page

Configure global settings for the entire application. All settings are saved in your browser's local storage. Click "Save Changes" to apply.

### Branding & Copyright
- Set your **Artist Name**, **Studio Name**, current **Album Name**, and a default **Copyright** string. This information is used throughout the app and in exports.

### Studio Details
- **Studio/Artist Logos**: Upload image files for your studio and artist/band logos.
- **Studio Bio**: A brief description of your studio or label.
- **Contact Info**: Your studio's website, email, and phone number.

### API Configuration
- **Gemini API Key**: Paste your Google Gemini API key here to enable AI features like lyric generation.

### Appearance & Customization
- **Theme**: Choose a color theme to personalize the application's look and feel.
- **Splash Screen Background**: Upload a custom background image for the app's startup screen.

### Server & Advanced Settings
- **Server Address**: A field for a server URL. While not used by Song Weaver directly, this can be useful for integration with future tools, such as your planned Promo Kit app.
