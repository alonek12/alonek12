const RPC = require("discord-rpc");
const express = require("express");
const WebSocket = require("ws");
const readline = require("readline");

// Create a command-line interface for input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask the user for their Discord App ID
rl.question("Enter your Discord Application ID: ", (clientId) => {
    if (!clientId.trim()) {
        console.error("❌ No App ID provided! Exiting...");
        process.exit(1);
    }

    console.log(`✅ Using Client ID: ${clientId}`);

    const app = express();
    const wss = new WebSocket.Server({ port: 8080 });

    const rpc = new RPC.Client({ transport: "ipc" });

    rpc.on("ready", () => {
        console.log("Connected to Discord RPC");

        wss.on("connection", (ws) => {
            ws.on("message", (data) => {
                const { title, url, favicon } = JSON.parse(data);

                const safeTitle = title && title.trim() ? title : "Browsing the Web";
                let safeUrl = url && url.trim() ? url : "Unknown Page";

                // **Fix: Trim URL if it's too long**
                if (safeUrl.length > 128) {
                    safeUrl = safeUrl.substring(0, 125) + "..."; // Keep it within 128 characters
                }

                // **Fix: Validate Favicon URL**
                let imageKey = "default"; // Default Discord RPC image
                if (favicon && favicon.startsWith("http")) {
                    imageKey = favicon; // Use favicon if it's a valid URL
                }

                rpc.setActivity({
                    details: safeTitle,
                    state: safeUrl, // Now always within 128 characters
                    largeImageKey: imageKey, // Use favicon or fallback to default
                    largeImageText: "Currently Browsing", // Tooltip on hover
                    instance: false,
                    startTimestamp: Date.now(),
                });

                console.log(`Updated RPC: ${safeTitle} - ${safeUrl} | Image: ${imageKey}`);
            });
        });
    });

    rpc.login({ clientId }).catch(console.error);

    app.listen(3000, () => console.log("Server running on port 3000"));

    rl.close(); // Close input after getting App ID
});
