const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('*', (_req, res) => {
  const rootIndex = path.join(__dirname, 'index.html');
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  res.sendFile(fs.existsSync(rootIndex) ? rootIndex : publicIndex);
});

app.listen(PORT, () => {
  console.log(`Aventura de las Vocales disponible en http://localhost:${PORT}`);
});
