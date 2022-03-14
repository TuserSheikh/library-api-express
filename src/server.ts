// module import
import 'dotenv/config';
import http from 'http';

// local import
import app from './app';
import initSetup from './utils/initSetup';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

(async () => {

    await initSetup();

    server.listen(PORT, () => console.log(`server listen on port ${PORT}`));

})();
