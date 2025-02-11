// Import necessary modules
const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const axios = require("axios");

// Load environment variables (if using .env)
require("dotenv").config();

// Initialize Discord bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// Initialize DisTube
const distube = new DisTube(client, {
    plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new YtDlpPlugin(),
    ],
});

// Ready event
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Ping-Pong Command
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "!ping") {
        const msg = await message.reply("🏓 Pong!");
        msg.edit(`🏓 Pong! Latency: ${msg.createdTimestamp - message.createdTimestamp}ms`);
    }

    // Music Commands
    else if (message.content.startsWith("!play ")) {
        const song = message.content.replace("!play ", "");
        distube.play(message.member.voice.channel, song, { textChannel: message.channel, member: message.member });
    } 
    else if (message.content === "!skip") {
        distube.skip(message);
    } 
    else if (message.content === "!stop") {
        distube.stop(message);
        message.channel.send("⏹️ Music stopped.");
    }

    // Gemini AI Command
    else if (message.content.startsWith("!ask ")) {
        const query = message.content.replace("!ask ", "");
        const response = await askGemini(query);
        message.reply(response);
    }
});

// Gemini AI Function (with Web Search)
async function askGemini(query) {
    try {
        // Replace with actual Gemini API call
        const geminiResponse = `🤖 Gemini: "${query}" sounds interesting! Let me double-check...`;

        // Double-check with web search
        const webSearch = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        const result = webSearch.data.Abstract || "No extra details found.";

        return `${geminiResponse}\n🌍 Web Check: ${result}`;
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        return "❌ Sorry, I couldn't process that request.";
    }
}

// Error Handling for DisTube
distube
    .on("playSong", (queue, song) => queue.textChannel.send(`🎶 Playing: ${song.name}`))
    .on("addSong", (queue, song) => queue.textChannel.send(`➕ Added: ${song.name}`))
    .on("error", (channel, error) => channel.send(`❌ Error: ${error.message}`));

// Log in to Discord
client.login(process.env.TOKEN);
