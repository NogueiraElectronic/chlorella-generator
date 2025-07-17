// server.js - Versión de DIAGNÓSTICO para Railway
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging detallado para diagnóstico
console.log('🚀 Iniciando servidor Chlorella...');
console.log(`📂 Directorio actual: ${__dirname}`);
console.log(`🌐 Puerto configurado: ${PORT}`);
console.log(`📁 Archivos en directorio:`, fs.readdirSync(__dirname));

// Middleware básico con logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Crear directorio para datasets
const datasetsDir = path.join(__dirname, 'generated_datasets');
if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
    console.log('📁 Directorio datasets creado:', datasetsDir);
}

// Health check endpoint - MÁS ROBUSTO
app.get('/health', (req, res) => {
    console.log('💚 Health check solicitado');
    res.status(200).json({ 
        status: 'OK', 
        message: 'Chlorella Generator Running',
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0_diagnostic'
    });
});

// Test endpoint - MEJORADO
app.get('/test', (req, res) => {
    console.log('🔧 Test endpoint solicitado');
    try {
        res.status(200).json({ 
            success: true,
            message: 'Servidor Chlorella OK - Diagnóstico', 
            time: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            routes: [
                '/health',
                '/test', 
                '/generate-dataset',
                '/sample-data/:folder',
                '/download/:folder/:filename',
                '/correlations/:folder'
            ],
            diagnostics: {
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                platform: process.platform,
                nodeVersion: process.version,
                datasetsDir: datasetsDir,
                datasetsExists: fs.existsSync(datasetsDir)
            }
        });
    } catch (error) {
        console.error('❌ Error en test endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Endpoint de información del sistema
app.get('/info', (req, res) => {
    console.log('ℹ️ Info endpoint solicitado');
    
    try {
        const info = {
            server: {
                status: 'running',
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memory: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            },
            application: {
                name: 'Chlorella Dataset Generator',
                version: '2.0_diagnostic',
                datasetsDir: datasetsDir,
                datasetsExists: fs.existsSync(datasetsDir)
            },
            files: {
                currentDir: __dirname,
                filesInRoot: fs.readdirSync(__dirname),
                publicExists: fs.existsSync(path.join(__dirname, 'public')),
                indexExists: fs.existsSync(path.join(__dirname, 'public', 'index.html'))
            }
        };
        
        res.json(info);
    } catch (error) {
        console.error('❌ Error en info endpoint:', error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// Función simplificada para generar datos de prueba
function generateTestData(scenarios = 5, totalDays = 7) {
    console.log(`🧪 Generando datos de prueba: ${scenarios} escenarios, ${totalDays} días`);
    
    const data = [];
    const hoursTotal = totalDays * 24;
    
    for (let s = 1; s <= scenarios; s++) {
        let biomass = 0.1;
        
        for (let h = 0; h < hoursTotal; h++) {
            const growthRate = 0.02 + Math.random() * 0.03;
            biomass = biomass * (1 + growthRate);
            
            data.push({
                Scenario: s,
                Time_h: h,
                Time_days: parseFloat((h / 24).toFixed(2)),
                Biomass_g_L: parseFloat(biomass.toFixed(4)),
                Temperature_C: parseFloat((25 + Math.random() * 10).toFixed(2)),
                pH: parseFloat((7.5 + Math.random() * 1.5).toFixed(2)),
                PAR_umol_m2_s: parseFloat((100 + Math.random() * 200).toFixed(1)),
                Growth_Rate_mu_h: parseFloat(growthRate.toFixed(5)),
                Instantaneous_Productivity_g_L_d: parseFloat((growthRate * biomass * 24).toFixed(4))
            });
        }
    }
    
    console.log(`✅ Datos generados: ${data.length} registros`);
    return data;
}

// Convertir a CSV simple
function toCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];
    
    data.forEach(row => {
        rows.push(headers.map(h => row[h]).join(','));
    });
    
    return rows.join('\n');
}

// Endpoint principal SIMPLIFICADO para diagnóstico
app.post('/generate-dataset', (req, res) => {
    console.log('📊 Generate dataset solicitado');
    console.log('Body recibido:', req.body);
    
    try {
        const { 
            scenarios = 5, 
            totalDays = 7,
            variabilityLevel = 'medium' 
        } = req.body;
        
        // Validaciones básicas
        if (scenarios < 1 || scenarios > 50) {
            return res.status(400).json({ 
                success: false, 
                error: 'Escenarios debe estar entre 1 y 50 (versión diagnóstico)' 
            });
        }
        
        if (totalDays < 1 || totalDays > 30) {
            return res.status(400).json({ 
                success: false, 
                error: 'Días debe estar entre 1 y 30 (versión diagnóstico)' 
            });
        }
        
        console.log(`🚀 Generando ${scenarios} escenarios de ${totalDays} días`);
        
        // Generar datos de prueba
        const data = generateTestData(scenarios, totalDays);
        
        // Dividir datos
        const shuffled = data.sort(() => Math.random() - 0.5);
        const trainSize = Math.floor(shuffled.length * 0.7);
        const validSize = Math.floor(shuffled.length * 0.15);
        
        const train = shuffled.slice(0, trainSize);
        const valid = shuffled.slice(trainSize, trainSize + validSize);
        const test = shuffled.slice(trainSize + validSize);
        
        // Crear directorio único
        const timestamp = Date.now();
        const folderName = `chlorella_${timestamp}`;
        const folder = path.join(datasetsDir, folderName);
        
        console.log(`📁 Creando directorio: ${folder}`);
        fs.mkdirSync(folder, { recursive: true });
        
        // Guardar archivos CSV
        try {
            fs.writeFileSync(path.join(folder, 'complete_dataset.csv'), toCSV(data));
            fs.writeFileSync(path.join(folder, 'training_data.csv'), toCSV(train));
            fs.writeFileSync(path.join(folder, 'validation_data.csv'), toCSV(valid));
            fs.writeFileSync(path.join(folder, 'test_data.csv'), toCSV(test));
            
            console.log('✅ Archivos CSV guardados exitosamente');
        } catch (writeError) {
            console.error('❌ Error escribiendo archivos:', writeError);
            return res.status(500).json({ 
                success: false, 
                error: 'Error guardando archivos CSV: ' + writeError.message
            });
        }
        
        // Estadísticas básicas
        const biomassValues = data.map(d => d.Biomass_g_L);
        const stats = {
            totalPoints: data.length,
            trainingPoints: train.length,
            validationPoints: valid.length,
            testPoints: test.length,
            scenarios: scenarios,
            duration: `${totalDays} days`,
            biomassRange: {
                min: Math.min(...biomassValues),
                max: Math.max(...biomassValues),
                mean: biomassValues.reduce((a, b) => a + b, 0) / biomassValues.length
            },
            outputDir: folder,
            folderName: folderName
        };
        
        console.log('✅ Dataset generado exitosamente');
        res.json({ 
            success: true, 
            stats, 
            outputDir: folder,
            message: 'Dataset de prueba generado correctamente (versión diagnóstico)'
        });
        
    } catch (error) {
        console.error('❌ Error generando dataset:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error interno del servidor',
            stack: error.stack
        });
    }
});

// Endpoint para obtener muestra
app.get('/sample-data/:folder', (req, res) => {
    console.log(`📈 Sample data solicitado para folder: ${req.params.folder}`);
    
    try {
        const filePath = path.join(datasetsDir, req.params.folder, 'complete_dataset.csv');
        console.log(`📂 Buscando archivo: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log('❌ Archivo no encontrado');
            return res.status(404).json({ 
                error: 'Dataset no encontrado',
                folder: req.params.folder,
                searchPath: filePath,
                datasetsDir: datasetsDir,
                availableFolders: fs.readdirSync(datasetsDir)
            });
        }
        
        const csv = fs.readFileSync(filePath, 'utf8');
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        console.log(`📊 Procesando CSV: ${lines.length} líneas, ${headers.length} columnas`);
        
        // Tomar muestra
        const sampleSize = Math.min(500, lines.length - 1);
        const data = [];
        
        for (let i = 1; i <= sampleSize; i++) {
            if (lines[i] && lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((header, idx) => {
                    const value = values[idx];
                    row[header] = isNaN(value) ? value : parseFloat(value);
                });
                data.push(row);
            }
        }
        
        console.log(`✅ Muestra preparada: ${data.length} registros`);
        res.json({
            data: data,
            sampleSize: data.length,
            totalRows: lines.length - 1,
            headers: headers,
            samplingMethod: 'simple'
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo muestra:', error);
        res.status(500).json({ 
            error: 'Error leyendo datos',
            details: error.message,
            stack: error.stack
        });
    }
});

// Endpoint para descargar archivos
app.get('/download/:folder/:filename', (req, res) => {
    console.log(`📥 Download solicitado: ${req.params.folder}/${req.params.filename}`);
    
    try {
        const filePath = path.join(datasetsDir, req.params.folder, req.params.filename);
        console.log(`📂 Buscando archivo para descarga: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log('❌ Archivo no encontrado para descarga');
            return res.status(404).json({ 
                error: 'Archivo no encontrado',
                path: req.params.filename,
                folder: req.params.folder,
                fullPath: filePath
            });
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        res.setHeader('Content-Type', 'text/csv');
        
        console.log(`✅ Enviando archivo: ${req.params.filename}`);
        res.sendFile(filePath);
        
    } catch (error) {
        console.error('❌ Error preparando descarga:', error);
        res.status(500).json({ 
            error: 'Error interno',
            details: error.message
        });
    }
});

// Ruta principal con diagnóstico
app.get('/', (req, res) => {
    console.log('🏠 Ruta principal solicitada');
    
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log(`📂 Buscando index en: ${indexPath}`);
    
    if (fs.existsSync(indexPath)) {
        console.log('✅ Index.html encontrado, sirviendo archivo');
        res.sendFile(indexPath);
    } else {
        console.log('⚠️ Index.html no encontrado, sirviendo HTML de diagnóstico');
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Chlorella Generator - Diagnóstico</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            max-width: 800px; 
                            margin: 0 auto; 
                            padding: 20px;
                            background: #f5f5f5;
                        }
                        .container { 
                            background: white; 
                            padding: 30px; 
                            border-radius: 10px; 
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .header { 
                            text-align: center; 
                            color: #2c3e50; 
                            margin-bottom: 30px;
                        }
                        .status { 
                            background: #d4edda; 
                            color: #155724; 
                            padding: 15px; 
                            border-radius: 5px; 
                            margin: 20px 0;
                        }
                        .info { 
                            background: #f8f9fa; 
                            padding: 15px; 
                            border-radius: 5px; 
                            margin: 10px 0;
                        }
                        .btn { 
                            background: #007bff; 
                            color: white; 
                            padding: 10px 20px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            margin: 10px;
                            display: inline-block;
                        }
                        .btn:hover { background: #0056b3; }
                        .diagnostic { 
                            background: #fff3cd; 
                            color: #856404; 
                            padding: 15px; 
                            border-radius: 5px; 
                            margin: 20px 0;
                        }
                        .error { 
                            background: #f8d7da; 
                            color: #721c24; 
                            padding: 15px; 
                            border-radius: 5px; 
                            margin: 20px 0;
                        }
                        pre { 
                            background: #f8f9fa; 
                            padding: 10px; 
                            border-radius: 5px; 
                            overflow-x: auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🧬 Generador Chlorella vulgaris</h1>
                            <h2>Versión Diagnóstico</h2>
                        </div>
                        
                        <div class="status">
                            <h3>✅ Servidor funcionando correctamente</h3>
                            <p><strong>Puerto:</strong> ${PORT}</p>
                            <p><strong>Tiempo:</strong> ${new Date().toISOString()}</p>
                            <p><strong>Uptime:</strong> ${process.uptime().toFixed(2)}s</p>
                        </div>
                        
                        <div class="diagnostic">
                            <h3>🔍 Información de Diagnóstico</h3>
                            <p><strong>Directorio actual:</strong> ${__dirname}</p>
                            <p><strong>Directorio datasets:</strong> ${datasetsDir}</p>
                            <p><strong>Archivos en raíz:</strong> ${fs.readdirSync(__dirname).join(', ')}</p>
                            <p><strong>Public existe:</strong> ${fs.existsSync(path.join(__dirname, 'public')) ? 'Sí' : 'No'}</p>
                            <p><strong>Index.html existe:</strong> ${fs.existsSync(indexPath) ? 'Sí' : 'No'}</p>
                        </div>
                        
                        <div class="info">
                            <h3>🚀 Endpoints disponibles</h3>
                            <ul>
                                <li><strong>GET /</strong> - Esta página</li>
                                <li><strong>GET /health</strong> - Health check</li>
                                <li><strong>GET /test</strong> - Test de conectividad</li>
                                <li><strong>GET /info</strong> - Información del sistema</li>
                                <li><strong>POST /generate-dataset</strong> - Generar dataset</li>
                                <li><strong>GET /sample-data/:folder</strong> - Obtener muestra</li>
                                <li><strong>GET /download/:folder/:filename</strong> - Descargar archivo</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="/health" class="btn">💚 Health Check</a>
                            <a href="/test" class="btn">🔧 Test Endpoint</a>
                            <a href="/info" class="btn">ℹ️ Info Sistema</a>
                        </div>
                        
                        <div class="error">
                            <h3>📋 Instrucciones</h3>
                            <p>1. Coloca el archivo <code>index.html</code> en la carpeta <code>public/</code></p>
                            <p>2. Asegúrate de que el <code>package.json</code> tenga el script de start correcto</p>
                            <p>3. Verifica que Railway esté usando el puerto correcto (${PORT})</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('💥 Error del servidor:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message,
        stack: err.stack
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        method: req.method,
        path: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /test',
            'GET /info',
            'POST /generate-dataset',
            'GET /sample-data/:folder',
            'GET /download/:folder/:filename'
        ]
    });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Chlorella DIAGNÓSTICO iniciado exitosamente`);
    console.log(`🌐 Puerto: ${PORT}`);
    console.log(`📍 Host: 0.0.0.0`);
    console.log(`🕐 Tiempo: ${new Date().toISOString()}`);
    console.log(`📂 Directorio: ${__dirname}`);
    console.log(`✅ Listo para recibir conexiones`);
});

// Manejo de errores del servidor
server.on('error', (err) => {
    console.error('💥 Error del servidor:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
    }
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Logging adicional para depuración
process.on('uncaughtException', (err) => {
    console.error('💥 Excepción no capturada:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesa rechazada no manejada:', reason);
    console.error('En promesa:', promise);
});

module.exports = app;
