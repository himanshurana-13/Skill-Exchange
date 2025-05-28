const serviceRequestsRouter = require('./routes/serviceRequests');
const skillProfileRouter = require('./routes/skillProfile');

app.use('/api/service-requests', serviceRequestsRouter);
app.use('/api/skill-profile', skillProfileRouter); 