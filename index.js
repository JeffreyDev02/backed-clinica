const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./routes/userRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const medicoRoutes = require('./routes/medicoRoutes');
const citaRoutes = require('./routes/citaRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const especialidadRoutes = require('./routes/especialidadRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const expedienteRoutes = require('./routes/expedienteRoutes');

app.use('/api/users', userRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/expediente', expedienteRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`)
})