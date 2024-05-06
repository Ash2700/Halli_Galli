document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();  // 防止表单默认提交行为
    const playerName = document.getElementById('playerName').value;
    fetch('/enter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `playerName=${encodeURIComponent(playerName)}`
    }).then(response => {
      window.location.href = response.url;  // 重定向到大厅页面
    });
  });
})