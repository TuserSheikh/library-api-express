// module import
import 'dotenv/config';
import http from 'http';

// local import
import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server listen on port ${PORT}`);
});
