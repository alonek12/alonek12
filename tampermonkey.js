// ==UserScript==
// @name         Discord RPC Web
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sends active tab info to the Discord RPC Node.js server
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const SERVER_URL = "ws://localhost:8080"; 
    let socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
        console.log("Connected to Discord RPC server");
        sendTabInfo();
    };

    socket.onclose = () => console.log("Disconnected from RPC server");

    function sendTabInfo() {
        const title = document.title;
        const url = window.location.href;
        const data = JSON.stringify({ title, url });

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(data);
            console.log("Sent tab info:", data);
        } else {
            console.error("WebSocket not open");
        }
    }

    
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            sendTabInfo();
        }
    });

    setInterval(sendTabInfo, 5000); 
})();
