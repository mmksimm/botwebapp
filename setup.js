const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

// Функция для создания проекта
async function createProject() {
    const projectPath = path.join(__dirname, 'project-folder');
    const publicPath = path.join(projectPath, 'public');
    const imagePath = path.join(publicPath, 'image');

    // Создаем структуру папок
    await fs.ensureDir(publicPath);
    await fs.ensureDir(imagePath);

    // Создаем HTML файл
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>mineGrow Bot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #000;
        }
        .container {
            width: 90%;
            max-width: 600px;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header h1 {
            margin: 0;
            font-size: 1.5em;
        }
        .header a {
            color: #1a73e8;
            text-decoration: none;
        }
        .note {
            display: flex;
            align-items: center;
            margin: 20px 0;
        }
        .note img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .note-text {
            display: flex;
            flex-direction: column;
        }
        .note-text h2 {
            margin: 0;
            font-size: 1.2em;
        }
        .note-text p {
            margin: 0;
            color: #555;
        }
        .timeline {
            background-color: #e0e0e0;
            padding: 10px;
            border-radius: 10px;
        }
        .timeline div {
            background-color: #fff;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        }
        .share-button {
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }
        .input-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .input-container input {
            width: calc(100% - 60px);
            padding: 5px;
            margin: 5px 0;
        }
        .buttons-container button {
            margin: 5px 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="#">Отмена</a>
            <h1>mineGrow бот</h1>
        </div>
        <div class="input-container">
            <input type="text" id="username" placeholder="Имя пользователя">
            <input type="password" id="password" placeholder="Пароль">
        </div>
        <div class="buttons-container">
            <button id="registerButton">Регистрация</button>
            <button id="loginButton">Вход</button>
        </div>
        <div class="note">
            <img src="image/profile.png" alt="Profile Picture">
            <div class="note-text">
                <h2 id="userName">Имя пользователя (me)</h2>
                <p id="userBoard">Here is my board</p>
            </div>
        </div>
        <div>
            <h3>Добро пожаловать,</h3>
            <p>Уровень: <span id="userLevel">1</span></p>
            <p>Токены: <span id="userTokens">0</span></p>
            <p>Семена: <span id="userSeeds">0</span></p>
        </div>
        <div class="buttons-container">
            <button onclick="switchPage('gardenPage')">Сад</button>
            <button onclick="switchPage('miningPage')">Майнинг</button>
            <button onclick="switchPage('mapPage')">Карта</button>
        </div>
        <div id="gardenPage" class="page">
            <h3>Сад</h3>
            <button id="plantButton">Сажать</button>
            <button id="waterButton">Поливать</button>
            <button id="harvestButton">Собирать урожай</button>
            <p id="plantStatus">Нет растений.</p>
            <p>Прогресс: <span id="plantProgress">0</span>%</p>
        </div>
        <div id="miningPage" class="page">
            <h3>Майнинг</h3>
            <!-- Контент для майнинга -->
        </div>
        <div id="mapPage" class="page">
            <h3>Карта</h3>
            <!-- Контент для карты -->
        </div>
        <button class="share-button">Поделиться</button>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const registerButton = document.getElementById('registerButton');
            const loginButton = document.getElementById('loginButton');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const userNameDisplay = document.getElementById('userName');
            const userLevelDisplay = document.getElementById('userLevel');
            const userTokensDisplay = document.getElementById('userTokens');
            const userSeedsDisplay = document.getElementById('userSeeds');
            const plantStatus = document.getElementById('plantStatus');
            const plantProgress = document.getElementById('plantProgress');
            let user = null;
            let plantState = {
                hasPlant: false,
                isGrown: false,
                waterCount: 0,
                lastWatered: null,
                plantedAt: null
            };

            async function registerUser() {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();
                if (username && password) {
                    try {
                        const response = await fetch('/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });
                        if (!response.ok) {
                            const data = await response.json();
                            alert(data.error);
                            return;
                        }
                        user = await response.json();
                        showUserInfo();
                    } catch (error) {
                        console.error('Ошибка при регистрации:', error);
                    }
                }
            }

            async function loginUser() {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();
                if (username && password) {
                    try {
                        const response = await fetch('/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });
                        if (!response.ok) {
                            const data = await response.json();
                            alert(data.error);
                            return;
                        }
                        user = await response.json();
                        showUserInfo();
                    } catch (error) {
                        console.error('Ошибка при входе:', error);
                    }
                }
            }

            function showUserInfo() {
                if (user) {
                    userNameDisplay.textContent = user.username;
                    userLevelDisplay.textContent = user.level;
                    userTokensDisplay.textContent = user.tokens;
                    userSeedsDisplay.textContent = user.seeds;
                }
            }

            function switchPage(pageId) {
                document.querySelectorAll('.page').forEach(page => {
                    page.style.display = 'none';
                });
                document.getElementById(pageId).style.display = 'block';
            }

            registerButton.addEventListener('click', registerUser);
            loginButton.addEventListener('click', loginUser);

            // По умолчанию показываем первую страницу
            switchPage('gardenPage');
        });
    </script>
</body>
</html>
    `;
    await fs.writeFile(path.join(publicPath, 'index.html'), htmlContent);

    // Создаем серверный файл
    const serverContent = `
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    level INTEGER DEFAULT 1,
    tokens INTEGER DEFAULT 0,
    seeds INTEGER DEFAULT 0
  )\`);
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Имя пользователя и пароль обязательны.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(\`INSERT INTO users (username, password) VALUES (?, ?)\`, [username, hashedPassword], function (err) {
    if (err) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует.' });
    }
    db.get(\`SELECT * FROM users WHERE id = ?\`, [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера.' });
      }
      res.json(row);
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Имя пользователя и пароль обязательны.' });
  }

  db.get(\`SELECT * FROM users WHERE username = ?\`, [username], (err, row) => {
    if (err || !row || !bcrypt.compareSync(password, row.password)) {
      return res.status(400).json({ error: 'Неверное имя пользователя или пароль.' });
    }
    res.json(row);
  });
});

app.post('/user', (req, res) => {
  const { id, tokens, seeds } = req.body;
  db.run(\`UPDATE users SET tokens = ?, seeds = ? WHERE id = ?\`, [tokens, seeds, id], err => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
    res.status(200).send();
  });
});

app.listen(port, () => {
  console.log(\`Сервер запущен на порту \${port}\`);
});
    `;
    await fs.writeFile(path.join(projectPath, 'server.js'), serverContent);

    // Создаем package.json
    const packageContent = {
        name: "project-folder",
        version: "1.0.0",
        main: "server.js",
        scripts: {
            start: "node server.js"
        },
        dependencies: {
            "express": "^4.17.1",
            "body-parser": "^1.19.0",
            "bcrypt": "^5.0.1",
            "sqlite3": "^5.0.2"
        }
    };
    await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageContent, null, 2));

    // Создаем пустую базу данных
    const db = new sqlite3.Database(path.join(projectPath, 'database.sqlite'));
    db.close();

    console.log('Проект успешно создан.');

    // Устанавливаем зависимости
    exec(`cd ${projectPath} && npm install`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Ошибка при установке зависимостей: ${err}`);
            return;
        }
        console.log(`Зависимости установлены: ${stdout}`);

        // Удаляем скрипт самоуничтожения
        const scriptPath = __filename;
        setTimeout(() => {
            fs.unlinkSync(scriptPath);
            console.log('Скрипт самоуничтожился.');
        }, 5000);
    });
}

createProject();
