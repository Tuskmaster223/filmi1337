const uploadForm = document.getElementById('uploadForm');
const videoInput = document.getElementById('videoInput');
const uploadStatus = document.getElementById('uploadStatus');
const videoListDiv = document.getElementById('videoList');

// Загрузка списка видео с сервера
async function loadVideos() {
    try {
        const response = await fetch('/videos');
        if (!response.ok) throw new Error('Ошибка загрузки списка');
        const videos = await response.json();
        
        if (videos.length === 0) {
            videoListDiv.innerHTML = '<p>Пока нет загруженных видео. Загрузите первое!</p>';
            return;
        }
        
        videoListDiv.innerHTML = videos.map(video => `
            <div class="video-card">
                <video controls preload="metadata">
                    <source src="/uploads/${encodeURIComponent(video)}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
                <div class="video-info">${escapeHtml(video)}</div>
            </div>
        `).join('');
    } catch (error) {
        videoListDiv.innerHTML = '<p class="error">Не удалось загрузить список видео</p>';
        console.error(error);
    }
}

// Вспомогательная функция для защиты от XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Отправка видео на сервер
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = videoInput.files[0];
    if (!file) {
        uploadStatus.textContent = 'Выберите файл!';
        uploadStatus.className = 'status error';
        return;
    }
    
    const formData = new FormData();
    formData.append('video', file);
    
    uploadStatus.textContent = 'Загрузка...';
    uploadStatus.className = 'status';
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            uploadStatus.textContent = `✅ ${data.message}`;
            uploadStatus.className = 'status success';
            videoInput.value = '';
            loadVideos(); // обновляем список
        } else {
            throw new Error(data.error || 'Ошибка загрузки');
        }
    } catch (error) {
        uploadStatus.textContent = `❌ Ошибка: ${error.message}`;
        uploadStatus.className = 'status error';
    }
});

// Первоначальная загрузка списка
loadVideos();