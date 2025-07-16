// server.js - Servidor completo con generación avanzada
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuración de puerto para Railway
const PORT = process.env.PORT || 3000;

console.log('Iniciando servidor...');
console.log('Puerto configurado:', PORT);
console.log('Variables de entorno PORT:', process.env.PORT);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Función para generar datos de un escenario con modelo avanzado
function generateAdvancedScenarioData(scenarioId, params, hours, resolution) {
    const data = [];
    
    // Variables del cultivo
    let currentBiomass = params.initialBiomass;
    let currentCellConc = currentBiomass * 2e6;
    let currentpH = params.basePH;
    let currentTemp = params.baseTemp;
    let nutrients = params.nutrientLevel;
    
    const timeStep = resolution;
    
    try {
        for (let t = 0; t < hours; t += timeStep) {
            const hour = Math.floor(t);
            
            // Ciclo de luz avanzado
            let lightIntensity;
            if (params.lightRegime === 'continuous') {
                lightIntensity = params.maxPAR * (0.8 + 0.2 * Math.random());
            } else {
                const hourOfDay = hour % 24;
                if (hourOfDay >= 6 && hourOfDay <= 18) {
                    lightIntensity = params.maxPAR * Math.sin((hourOfDay - 6) * Math.PI / 12);
                } else {
                    lightIntensity = 0;
                }
            }
            
            // Variaciones ambientales realistas
            const tempVariation = params.stressType === 'thermal' ? 
                5 + Math.random() * 3 : Math.random() * 2 - 1;
            currentTemp = Math.max(15, Math.min(40, 
                params.baseTemp + tempVariation + 2 * Math.sin(t * Math.PI / 12)));
            
            const pHDrift = params.stressType === 'ph' ? 
                -0.5 + Math.random() * 0.2 : (Math.random() - 0.5) * 0.1;
            currentpH = Math.max(6.0, Math.min(9.0, 
                params.basePH + pHDrift + 0.3 * Math.sin(t * 0.05)));
            
            // Depleción de nutrientes
            nutrients = Math.max(0.1, nutrients - 0.001 * currentBiomass * timeStep);
            
            // Modelo cinético de Monod avanzado
            const muMax = 0.08;
            const Ks_light = 300;
            const Ks_nutrient = 0.1;
            const Ki_biomass = 4;
            
            const lightEffect = lightIntensity / (lightIntensity + Ks_light);
            const tempEffect = currentTemp >= 15 && currentTemp <= 35 ? 
                Math.exp(-Math.pow((currentTemp - 25) / 10, 2)) : 0.1;
            const pHEffect = currentpH >= 6.5 && currentpH <= 8.5 ? 
                Math.exp(-Math.pow((currentpH - 7.2) / 1.5, 2)) : 0.1;
            const nutrientEffect = nutrients / (nutrients + Ks_nutrient);
            const inhibitionEffect = Ki_biomass / (Ki_biomass + currentBiomass);
            
            const mu = muMax * lightEffect * tempEffect * pHEffect * nutrientEffect * inhibitionEffect;
            
            // Aplicar ruido según calidad
            const growthRate = Math.max(0, mu + (Math.random() - 0.5) * params.noiseLevel);
            
            // Actualizar biomasa con modelo exponencial
            currentBiomass = Math.min(currentBiomass * Math.exp(growthRate * timeStep), 5.0);
            currentCellConc = currentCellConc * Math.exp(growthRate * timeStep);
            
            // Aplicar ruido a las mediciones
            const biomassNoise = currentBiomass * (1 + (Math.random() - 0.5) * params.noiseLevel);
            const cellConcNoise = currentCellConc * (1 + (Math.random() - 0.5) * params.noiseLevel);
            
            // Crear punto de datos
            const dataPoint = {
                Scenario: scenarioId,
                Time_h: parseFloat(t.toFixed(2)),
                DateTime: new Date(Date.now() + t * 3600000).toISOString(),
                pH: parseFloat(currentpH.toFixed(params.precision)),
                Temperature_C: parseFloat(currentTemp.toFixed(params.precision)),
                PAR_umol_m2_s: parseFloat(lightIntensity.toFixed(params.precision)),
                Growth_Rate_h: parseFloat(growthRate.toFixed(params.precision + 1)),
                Biomass_g_L: parseFloat(biomassNoise.toFixed(params.precision)),
                Cell_Concentration_cells_mL: parseFloat(cellConcNoise.toFixed(0)),
                Nutrients_g_L: parseFloat(nutrients.toFixed(params.precision)),
                Optical_Density_OD680: parseFloat((currentBiomass * 2.5).toFixed(params.precision)),
                Productivity_g_L_d: parseFloat((currentBiomass * growthRate * 24).toFixed(params.precision)),
                Light_Efficiency: parseFloat((mu / Math.max(0.001, lightIntensity / 1000)).toFixed(params.precision + 1)),
                Thermal_Stress: currentTemp > 32 || currentTemp < 18 ? 1 : 0,
                pH_Stress: currentpH < 6.5 || currentpH > 8.5 ? 1 : 0,
                Light_Regime: params.lightRegime,
                Stress_Condition: params.stressType,
                Data_Quality: params.dataQuality,
                Sampling_Resolution: params.samplingResolution
            };
            
            data.push(dataPoint);
        }
    } catch (error) {
        console.error(`Error generando escenario ${scenarioId}:`, error);
        throw error;
    }
    
    return data;
}

// Función para mezclar array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Función para convertir a CSV
function arrayToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) value = '';
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        }).join(','))
    ].join('\n');
    
    return csvContent;
}

// Función auxiliar para calcular completitud
function calculateCompleteness(data) {
    if (!data || data.length === 0) return 0;
    
    const totalFields = data.length * Object.keys(data[0]).length;
    const completeFields = data.reduce((sum, row) => {
        return sum + Object.values(row).filter(v => v !== null && v !== undefined && v !== '').length;
    }, 0);
    return (completeFields / totalFields) * 100;
}

// Endpoint principal para generar dataset
app.post('/generate-dataset', async (req, res) => {
    console.log('Recibida petición para generar dataset');
    console.log('Body:', req.body);
    
    const { 
        scenarios = 50, 
        hoursPerScenario = 240,
        dataQuality = 'industrial',
        stressConditions = 'balanced',
        temporalResolution = 'hour',
        advanced = false 
    } = req.body;
    
    try {
        console.log('Iniciando generación de dataset avanzado...');
        console.log(`Parámetros: ${scenarios} escenarios, ${hoursPerScenario} horas, calidad: ${dataQuality}`);
        
        // Configuración de calidad
        const qualityConfig = {
            research: { noise: 0.01, precision: 4 },
            industrial: { noise: 0.03, precision: 3 },
            pilot: { noise: 0.08, precision: 2 }
        };
        
        const stressConfig = {
            balanced: { thermal: 0.15, ph: 0.15 },
            low: { thermal: 0.05, ph: 0.10 },
            high: { thermal: 0.25, ph: 0.20 },
            extreme: { thermal: 0.35, ph: 0.25 }
        };
        
        const resolutionConfig = {
            '5min': 0.0833,
            '15min': 0.25,
            '30min': 0.5,
            'hour': 1
        };
        
        const quality = qualityConfig[dataQuality] || qualityConfig.industrial;
        const stress = stressConfig[stressConditions] || stressConfig.balanced;
        const resolution = resolutionConfig[temporalResolution] || 1;
        
        console.log('Configuración aplicada:', { quality, stress, resolution });
        
        const allData = [];
        
        // Generar múltiples escenarios
        for (let scenario = 0; scenario < scenarios; scenario++) {
            console.log(`Generando escenario ${scenario + 1}/${scenarios}`);
            
            const scenarioParams = {
                baseTemp: 20 + Math.random() * 10,
                basePH: 6.8 + Math.random() * 1.2,
                maxPAR: 400 + Math.random() * 600,
                initialBiomass: 0.05 + Math.random() * 0.3,
                nutrientLevel: 0.5 + Math.random() * 0.5,
                lightRegime: Math.random() > 0.5 ? 'continuous' : 'cyclic',
                stressType: Math.random() < stress.thermal ? 'thermal' : 
                           Math.random() < stress.ph ? 'ph' : 'normal',
                noiseLevel: quality.noise,
                precision: quality.precision,
                dataQuality: dataQuality,
                samplingResolution: temporalResolution
            };
            
            const scenarioData = generateAdvancedScenarioData(
                scenario + 1, 
                scenarioParams, 
                hoursPerScenario, 
                resolution
            );
            
            allData.push(...scenarioData);
            
            // Progreso cada 10 escenarios
            if ((scenario + 1) % 10 === 0) {
                console.log(`Progreso: ${scenario + 1}/${scenarios} escenarios completados`);
            }
        }
        
        console.log(`Total de datos generados: ${allData.length}`);
        
        // Dividir datos en conjuntos
        const shuffledData = shuffleArray(allData);
        const trainSize = Math.floor(shuffledData.length * 0.7);
        const validSize = Math.floor(shuffledData.length * 0.15);
        
        const trainingData = shuffledData.slice(0, trainSize);
        const validationData = shuffledData.slice(trainSize, trainSize + validSize);
        const testData = shuffledData.slice(trainSize + validSize);
        
        console.log(`Datos divididos: ${trainingData.length} entrenamiento, ${validationData.length} validación, ${testData.length} prueba`);
        
        // Crear directorio de salida
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(__dirname, 'generated_datasets', timestamp);
        
        if (!fs.existsSync(path.dirname(outputDir))) {
            fs.mkdirSync(path.dirname(outputDir), { recursive: true });
        }
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        console.log(`Guardando archivos en: ${outputDir}`);
        
        // Guardar archivos
        fs.writeFileSync(path.join(outputDir, 'training_data.csv'), arrayToCSV(trainingData));
        fs.writeFileSync(path.join(outputDir, 'validation_data.csv'), arrayToCSV(validationData));
        fs.writeFileSync(path.join(outputDir, 'test_data.csv'), arrayToCSV(testData));
        fs.writeFileSync(path.join(outputDir, 'complete_dataset.csv'), arrayToCSV(allData));
        
        // Calcular estadísticas avanzadas
        const stats = {
            totalPoints: allData.length,
            trainingPoints: trainingData.length,
            validationPoints: validationData.length,
            testPoints: testData.length,
            scenarios: scenarios,
            duration: hoursPerScenario,
            biomassRange: {
                min: Math.min(...allData.map(d => d.Biomass_g_L)),
                max: Math.max(...allData.map(d => d.Biomass_g_L)),
                mean: allData.reduce((sum, d) => sum + d.Biomass_g_L, 0) / allData.length
            },
            stressDistribution: {
                thermal: allData.filter(d => d.Thermal_Stress === 1).length,
                ph: allData.filter(d => d.pH_Stress === 1).length,
                normal: allData.filter(d => d.Thermal_Stress === 0 && d.pH_Stress === 0).length
            },
            qualityMetrics: {
                completeness: calculateCompleteness(allData),
                dataQuality: dataQuality,
                resolution: temporalResolution
            },
            outputDir: outputDir
        };
        
        // Guardar metadatos
        const metadata = {
            generation_info: {
                timestamp: new Date().toISOString(),
                scenarios: scenarios,
                hours_per_scenario: hoursPerScenario,
                data_quality: dataQuality,
                stress_conditions: stressConditions,
                temporal_resolution: temporalResolution
            },
            statistics: stats,
            file_info: {
                training_file: 'training_data.csv',
                validation_file: 'validation_data.csv',
                test_file: 'test_data.csv',
                complete_file: 'complete_dataset.csv'
            }
        };
        
        fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
        
        console.log('Dataset generado exitosamente!');
        console.log(`Total de puntos: ${stats.totalPoints}`);
        console.log(`Directorio: ${outputDir}`);
        
        res.json({ 
            success: true, 
            stats, 
            outputDir,
            metadata,
            message: 'Dataset generado exitosamente'
        });
        
    } catch (error) {
        console.error('Error generando dataset:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Endpoint para descargar archivos
app.get('/download/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, 'generated_datasets', folder, filename);
    
    console.log(`Descarga solicitada: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error en descarga:', err);
                res.status(500).send('Error en descarga');
            }
        });
    } else {
        console.log('Archivo no encontrado:', filePath);
        res.status(404).send('Archivo no encontrado');
    }
});

// Endpoint para listar datasets generados
app.get('/datasets', (req, res) => {
    const datasetsDir = path.join(__dirname, 'generated_datasets');
    
    if (!fs.existsSync(datasetsDir)) {
        return res.json([]);
    }
    
    try {
        const folders = fs.readdirSync(datasetsDir).filter(item => {
            const itemPath = path.join(datasetsDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        
        const datasets = folders.map(folder => {
            const folderPath = path.join(datasetsDir, folder);
            const files = fs.readdirSync(folderPath);
            const stats = fs.statSync(folderPath);
            
            // Leer metadatos si existen
            let metadata = null;
            const metadataPath = path.join(folderPath, 'metadata.json');
            if (fs.existsSync(metadataPath)) {
                try {
                    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                } catch (error) {
                    console.warn('Error leyendo metadatos:', error);
                }
            }
            
            return {
                id: folder,
                created: stats.birthtime,
                metadata: metadata,
                files: files.map(file => ({
                    name: file,
                    size: fs.statSync(path.join(folderPath, file)).size
                }))
            };
        });
        
        res.json(datasets);
    } catch (error) {
        console.error('Error listando datasets:', error);
        res.status(500).json({ error: 'Error listando datasets' });
    }
});

// Endpoint para obtener muestra de datos para gráficas
app.get('/sample-data/:folder', (req, res) => {
    const { folder } = req.params;
    const { limit = 1000 } = req.query;
    
    const filePath = path.join(__dirname, 'generated_datasets', folder, 'complete_dataset.csv');
    
    console.log(`Muestra solicitada: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Dataset no encontrado' });
    }
    
    try {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const lines = csvData.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            return res.status(400).json({ error: 'Dataset vacío' });
        }
        
        const headers = lines[0].split(',');
        const sampleData = [];
        const step = Math.max(1, Math.floor((lines.length - 1) / parseInt(limit)));
        
        for (let i = 1; i < lines.length && sampleData.length < parseInt(limit); i += step) {
            const line = lines[i];
            if (line.trim()) {
                const values = line.split(',');
                const dataPoint = {};
                
                headers.forEach((header, index) => {
                    let value = values[index];
                    if (value && !isNaN(value) && value !== '') {
                        value = parseFloat(value);
                    }
                    dataPoint[header.trim()] = value;
                });
                
                sampleData.push(dataPoint);
            }
        }
        
        console.log(`Muestra generada: ${sampleData.length} registros`);
        res.json(sampleData);
        
    } catch (error) {
        console.error('Error leyendo muestra de datos:', error);
        res.status(500).json({ error: 'Error procesando datos' });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Página principal
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
            <h1>Generador de Dataset Chlorella</h1>
            <p>El archivo index.html no se encuentra en la carpeta public/</p>
            <p>Estructura esperada:</p>
            <ul>
                <li>server.js (este archivo)</li>
                <li>public/index.html</li>
                <li>package.json</li>
            </ul>
        `);
    }
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Crear directorio base si no existe
const datasetsDir = path.join(__dirname, 'generated_datasets');
if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
    console.log('Directorio de datasets creado');
}

// Función para manejar el cierre del servidor
function handleShutdown() {
    console.log('Cerrando servidor...');
    process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Accede a http://localhost:${PORT} para usar el generador`);
    console.log(`📁 Directorio de trabajo: ${__dirname}`);
    console.log(`📊 Directorio de datasets: ${datasetsDir}`);
    console.log(`🚀 Servidor listo para recibir peticiones`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
        console.log('Intentando con puerto alternativo...');
        
        // Intentar con un puerto aleatorio
        const alternativePort = Math.floor(Math.random() * 10000) + 3000;
        console.log(`Probando puerto ${alternativePort}...`);
        
        const alternativeServer = app.listen(alternativePort, '0.0.0.0', () => {
            console.log(`✅ Servidor ejecutándose en puerto alternativo ${alternativePort}`);
            console.log(`🌐 Accede a http://localhost:${alternativePort} para usar el generador`);
        });
        
        alternativeServer.on('error', (altError) => {
            console.error('❌ Error en servidor alternativo:', altError);
            process.exit(1);
        });
    } else {
        console.error('❌ Error del servidor:', error);
        process.exit(1);
    }
});

// Función para generar datos de un escenario con modelo avanzado
function generateAdvancedScenarioData(scenarioId, params, hours, resolution) {
    const data = [];
    
    // Variables del cultivo
    let currentBiomass = params.initialBiomass;
    let currentCellConc = currentBiomass * 2e6;
    let currentpH = params.basePH;
    let currentTemp = params.baseTemp;
    let nutrients = params.nutrientLevel;
    
    const timeStep = resolution;
    
    for (let t = 0; t < hours; t += timeStep) {
        const hour = Math.floor(t);
        
        // Ciclo de luz avanzado
        let lightIntensity;
        if (params.lightRegime === 'continuous') {
            lightIntensity = params.maxPAR * (0.8 + 0.2 * Math.random());
        } else {
            const hourOfDay = hour % 24;
            if (hourOfDay >= 6 && hourOfDay <= 18) {
                lightIntensity = params.maxPAR * Math.sin((hourOfDay - 6) * Math.PI / 12);
            } else {
                lightIntensity = 0;
            }
        }
        
        // Variaciones ambientales realistas
        const tempVariation = params.stressType === 'thermal' ? 
            5 + Math.random() * 3 : Math.random() * 2 - 1;
        currentTemp = Math.max(15, Math.min(40, 
            params.baseTemp + tempVariation + 2 * Math.sin(t * Math.PI / 12)));
        
        const pHDrift = params.stressType === 'ph' ? 
            -0.5 + Math.random() * 0.2 : (Math.random() - 0.5) * 0.1;
        currentpH = Math.max(6.0, Math.min(9.0, 
            params.basePH + pHDrift + 0.3 * Math.sin(t * 0.05)));
        
        // Depleción de nutrientes
        nutrients = Math.max(0.1, nutrients - 0.001 * currentBiomass * timeStep);
        
        // Modelo cinético de Monod avanzado
        const muMax = 0.08;
        const Ks_light = 300;
        const Ks_nutrient = 0.1;
        const Ki_biomass = 4;
        
        const lightEffect = lightIntensity / (lightIntensity + Ks_light);
        const tempEffect = currentTemp >= 15 && currentTemp <= 35 ? 
            Math.exp(-Math.pow((currentTemp - 25) / 10, 2)) : 0.1;
        const pHEffect = currentpH >= 6.5 && currentpH <= 8.5 ? 
            Math.exp(-Math.pow((currentpH - 7.2) / 1.5, 2)) : 0.1;
        const nutrientEffect = nutrients / (nutrients + Ks_nutrient);
        const inhibitionEffect = Ki_biomass / (Ki_biomass + currentBiomass);
        
        const mu = muMax * lightEffect * tempEffect * pHEffect * nutrientEffect * inhibitionEffect;
        
        // Aplicar ruido según calidad
        const growthRate = Math.max(0, mu + (Math.random() - 0.5) * params.noiseLevel);
        
        // Actualizar biomasa con modelo exponencial
        currentBiomass = Math.min(currentBiomass * Math.exp(growthRate * timeStep), 5.0);
        currentCellConc = currentCellConc * Math.exp(growthRate * timeStep);
        
        // Aplicar ruido a las mediciones
        const biomassNoise = currentBiomass * (1 + (Math.random() - 0.5) * params.noiseLevel);
        const cellConcNoise = currentCellConc * (1 + (Math.random() - 0.5) * params.noiseLevel);
        
        // Crear punto de datos
        const dataPoint = {
            Scenario: scenarioId,
            Time_h: parseFloat(t.toFixed(2)),
            DateTime: new Date(Date.now() + t * 3600000).toISOString(),
            pH: parseFloat(currentpH.toFixed(params.precision)),
            Temperature_C: parseFloat(currentTemp.toFixed(params.precision)),
            PAR_umol_m2_s: parseFloat(lightIntensity.toFixed(params.precision)),
            Growth_Rate_h: parseFloat(growthRate.toFixed(params.precision + 1)),
            Biomass_g_L: parseFloat(biomassNoise.toFixed(params.precision)),
            Cell_Concentration_cells_mL: parseFloat(cellConcNoise.toFixed(0)),
            Nutrients_g_L: parseFloat(nutrients.toFixed(params.precision)),
            Optical_Density_OD680: parseFloat((currentBiomass * 2.5).toFixed(params.precision)),
            Productivity_g_L_d: parseFloat((currentBiomass * growthRate * 24).toFixed(params.precision)),
            Light_Efficiency: parseFloat((mu / Math.max(0.001, lightIntensity / 1000)).toFixed(params.precision + 1)),
            Thermal_Stress: currentTemp > 32 || currentTemp < 18 ? 1 : 0,
            pH_Stress: currentpH < 6.5 || currentpH > 8.5 ? 1 : 0,
            Light_Regime: params.lightRegime,
            Stress_Condition: params.stressType,
            Data_Quality: params.dataQuality,
            Sampling_Resolution: params.samplingResolution
        };
        
        data.push(dataPoint);
    }
    
    return data;
}

// Función para mezclar array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Función para convertir a CSV
function arrayToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            let value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        }).join(','))
    ].join('\n');
    
    return csvContent;
}

// Endpoint principal para generar dataset
app.post('/generate-dataset', (req, res) => {
    const { 
        scenarios = 50, 
        hoursPerScenario = 240,
        dataQuality = 'industrial',
        stressConditions = 'balanced',
        temporalResolution = 'hour',
        advanced = false 
    } = req.body;
    
    try {
        console.log('Iniciando generación de dataset avanzado...');
        
        // Configuración de calidad
        const qualityConfig = {
            research: { noise: 0.01, precision: 4 },
            industrial: { noise: 0.03, precision: 3 },
            pilot: { noise: 0.08, precision: 2 }
        };
        
        const stressConfig = {
            balanced: { thermal: 0.15, ph: 0.15 },
            low: { thermal: 0.05, ph: 0.10 },
            high: { thermal: 0.25, ph: 0.20 },
            extreme: { thermal: 0.35, ph: 0.25 }
        };
        
        const resolutionConfig = {
            '5min': 0.0833,
            '15min': 0.25,
            '30min': 0.5,
            'hour': 1
        };
        
        const quality = qualityConfig[dataQuality];
        const stress = stressConfig[stressConditions];
        const resolution = resolutionConfig[temporalResolution];
        
        const allData = [];
        
        // Generar múltiples escenarios
        for (let scenario = 0; scenario < scenarios; scenario++) {
            const scenarioParams = {
                baseTemp: 20 + Math.random() * 10,
                basePH: 6.8 + Math.random() * 1.2,
                maxPAR: 400 + Math.random() * 600,
                initialBiomass: 0.05 + Math.random() * 0.3,
                nutrientLevel: 0.5 + Math.random() * 0.5,
                lightRegime: Math.random() > 0.5 ? 'continuous' : 'cyclic',
                stressType: Math.random() < stress.thermal ? 'thermal' : 
                           Math.random() < stress.ph ? 'ph' : 'normal',
                noiseLevel: quality.noise,
                precision: quality.precision,
                dataQuality: dataQuality,
                samplingResolution: temporalResolution
            };
            
            const scenarioData = generateAdvancedScenarioData(
                scenario + 1, 
                scenarioParams, 
                hoursPerScenario, 
                resolution
            );
            
            allData.push(...scenarioData);
            
            // Progreso cada 10 escenarios
            if (scenario % 10 === 0) {
                console.log(`Progreso: ${scenario}/${scenarios} escenarios completados`);
            }
        }
        
        // Dividir datos en conjuntos
        const shuffledData = shuffleArray(allData);
        const trainSize = Math.floor(shuffledData.length * 0.7);
        const validSize = Math.floor(shuffledData.length * 0.15);
        
        const trainingData = shuffledData.slice(0, trainSize);
        const validationData = shuffledData.slice(trainSize, trainSize + validSize);
        const testData = shuffledData.slice(trainSize + validSize);
        
        // Crear directorio de salida
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(__dirname, 'generated_datasets', timestamp);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Guardar archivos
        fs.writeFileSync(path.join(outputDir, 'training_data.csv'), arrayToCSV(trainingData));
        fs.writeFileSync(path.join(outputDir, 'validation_data.csv'), arrayToCSV(validationData));
        fs.writeFileSync(path.join(outputDir, 'test_data.csv'), arrayToCSV(testData));
        fs.writeFileSync(path.join(outputDir, 'complete_dataset.csv'), arrayToCSV(allData));
        
        // Calcular estadísticas avanzadas
        const stats = {
            totalPoints: allData.length,
            trainingPoints: trainingData.length,
            validationPoints: validationData.length,
            testPoints: testData.length,
            scenarios: scenarios,
            duration: hoursPerScenario,
            biomassRange: {
                min: Math.min(...allData.map(d => d.Biomass_g_L)),
                max: Math.max(...allData.map(d => d.Biomass_g_L)),
                mean: allData.reduce((sum, d) => sum + d.Biomass_g_L, 0) / allData.length
            },
            stressDistribution: {
                thermal: allData.filter(d => d.Thermal_Stress === 1).length,
                ph: allData.filter(d => d.pH_Stress === 1).length,
                normal: allData.filter(d => d.Thermal_Stress === 0 && d.pH_Stress === 0).length
            },
            qualityMetrics: {
                completeness: calculateCompleteness(allData),
                dataQuality: dataQuality,
                resolution: temporalResolution
            },
            outputDir: outputDir
        };
        
        // Guardar metadatos
        const metadata = {
            generation_info: {
                timestamp: new Date().toISOString(),
                scenarios: scenarios,
                hours_per_scenario: hoursPerScenario,
                data_quality: dataQuality,
                stress_conditions: stressConditions,
                temporal_resolution: temporalResolution
            },
            statistics: stats,
            file_info: {
                training_file: 'training_data.csv',
                validation_file: 'validation_data.csv',
                test_file: 'test_data.csv',
                complete_file: 'complete_dataset.csv'
            }
        };
        
        fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
        
        console.log('Dataset generado exitosamente!');
        console.log(`Total de puntos: ${stats.totalPoints}`);
        console.log(`Directorio: ${outputDir}`);
        
        res.json({ 
            success: true, 
            stats, 
            outputDir,
            metadata 
        });
        
    } catch (error) {
        console.error('Error generando dataset:', error);
        res.status(500).json({ error: error.message });
    }
});

// Función auxiliar para calcular completitud
function calculateCompleteness(data) {
    const totalFields = data.length * Object.keys(data[0]).length;
    const completeFields = data.reduce((sum, row) => {
        return sum + Object.values(row).filter(v => v !== null && v !== undefined && v !== '').length;
    }, 0);
    return (completeFields / totalFields) * 100;
}

// Endpoint para descargar archivos
app.get('/download/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, 'generated_datasets', folder, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

// Endpoint para listar datasets generados
app.get('/datasets', (req, res) => {
    const datasetsDir = path.join(__dirname, 'generated_datasets');
    
    if (!fs.existsSync(datasetsDir)) {
        return res.json([]);
    }
    
    const folders = fs.readdirSync(datasetsDir).filter(item => {
        return fs.statSync(path.join(datasetsDir, item)).isDirectory();
    });
    
    const datasets = folders.map(folder => {
        const folderPath = path.join(datasetsDir, folder);
        const files = fs.readdirSync(folderPath);
        const stats = fs.statSync(folderPath);
        
        // Leer metadatos si existen
        let metadata = null;
        const metadataPath = path.join(folderPath, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
            try {
                metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            } catch (error) {
                console.warn('Error leyendo metadatos:', error);
            }
        }
        
        return {
            id: folder,
            created: stats.birthtime,
            metadata: metadata,
            files: files.map(file => ({
                name: file,
                size: fs.statSync(path.join(folderPath, file)).size
            }))
        };
    });
    
    res.json(datasets);
});

// Endpoint para obtener muestra de datos para gráficas
app.get('/sample-data/:folder', (req, res) => {
    const { folder } = req.params;
    const { limit = 1000 } = req.query;
    
    const filePath = path.join(__dirname, 'generated_datasets', folder, 'complete_dataset.csv');
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Dataset no encontrado' });
    }
    
    try {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const sampleData = [];
        const step = Math.max(1, Math.floor(lines.length / parseInt(limit)));
        
        for (let i = 1; i < lines.length && sampleData.length < parseInt(limit); i += step) {
            const line = lines[i];
            if (line.trim()) {
                const values = line.split(',');
                const dataPoint = {};
                
                headers.forEach((header, index) => {
                    let value = values[index];
                    if (!isNaN(value) && value !== '') {
                        value = parseFloat(value);
                    }
                    dataPoint[header.trim()] = value;
                });
                
                sampleData.push(dataPoint);
            }
        }
        
        res.json(sampleData);
        
    } catch (error) {
        console.error('Error leyendo muestra de datos:', error);
        res.status(500).json({ error: 'Error procesando datos' });
    }
});

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT} para usar el generador`);
    
    // Crear directorio base si no existe
    const datasetsDir = path.join(__dirname, 'generated_datasets');
    if (!fs.existsSync(datasetsDir)) {
        fs.mkdirSync(datasetsDir, { recursive: true });
    }
});
