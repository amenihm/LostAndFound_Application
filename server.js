//The entry point to start the server.

require('dotenv').config();
const app = require('./app');


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
