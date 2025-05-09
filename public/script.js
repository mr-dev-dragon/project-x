function renderTaskList(containerSelector, data) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = "";

    data.forEach((page, index) => {
        const li = document.createElement("li");
        const avatarIndex = (index % 10) + 1;
        const avatarUrl = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/1940306/chat_avatar_0${avatarIndex}.jpg`;

        const total = page.content.length;
        const doneCount = page.content.filter(section => section.done).length;
        const percent = Math.round((doneCount / total) * 100);
        const statusClass = percent === 100 ? "green" : "orange";
        const statusText = percent === 100 ? "Done" : `${percent}%`;

        li.innerHTML = `
            <img src="${avatarUrl}" alt="">
            <div>
                <h2>${page.PAJE}</h2>
                <h3>
                    <span class="status ${statusClass}"></span>
                    ${statusText}
                </h3>
            </div>
        `;
        container.appendChild(li);
    });
}

function formatTime() {
    const date = new Date();
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

window.addEventListener('DOMContentLoaded', () => {
    renderTaskList("ul.hide-scrollbar", parameters);
});

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage(event) {
    if (event) event.preventDefault();

    const chatbox = document.getElementById('chat');
    const inputElement = document.getElementById('userInput');
    const input = inputElement?.value.trim();
    const files = document.getElementById('multiFile').files;


    // Prepare FormData for file and message upload
    const formData = new FormData();
    formData.append('message', input);
    for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]); // all files under same field name
    }



    if (!chatbox || !inputElement || !input) return;

    inputElement.value = '';

    function formatTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');
    }

    chatbox.innerHTML += `
        <li class="me">
            <div class="entete">
                <h3>${formatTime()}</h3>
                <h2>You</h2>
                <span class="status blue"></span>
            </div>
            <div class="triangle"></div>
            <div class="message">${input}</div>
        </li>`;

    chatbox.scrollTop = chatbox.scrollHeight;

    try {
        const formData = new FormData();
        formData.append('message', input);
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                const code = data.reply?.trim() || '';

                chatbox.innerHTML += `
            <li class="you">
                <div class="entete">
                    <span class="status green"></span>
                    <h2>AI</h2>
                    <h3>${formatTime()}</h3>
                </div>
                <div class="triangle"></div>
                <div class="message">
                    <div class="code-snippet">
                        <pre><code>${code}</code></pre>
                    </div>
                </div>
            </li>`;
            }

            catch (error) {
                chatbox.innerHTML += `<div><strong>AI-Error:</strong> ${error.message}</div>`;
            }




            document.querySelector('form').addEventListener('submit', function (event) {
                event.preventDefault();
                // Your custom logic here
            });
        }
    } catch (error) {
        chatbox.innerHTML += `<div><strong>AI-Error:</strong> ${error.message}</div>`;
    }
}







