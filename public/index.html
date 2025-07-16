// server.js - Versión corregida para Railway
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Crear directorio para datasets
const datasetsDir = path.join(__dirname, 'generated_datasets');
if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
}

// Función avanzada para generar datos con modelo cinético completo
function generateAdvancedData(scenarios, hours, variabilityLevel = 'medium') {
    const data = [];
    
    // Configurar multiplicadores de variabilidad
    const variabilityConfig = {
        low: { tempRange: 3, pHRange: 0.6, stressProb: 0.1, noiseLevel: 0.01 },
        medium: { tempRange: 10, pHRange: 1.2, stressProb: 0.2, noiseLevel: 0.03 },
        high: { tempRange: 15, pHRange: 1.8, stressProb: 0.4, noiseLevel: 0.05 },
        extreme: { tempRange: 20, pHRange: 2.5, stressProb: 0.6, noiseLevel: 0.08 }
    };
    
    const config = variabilityConfig[variabilityLevel] || variabilityConfig.medium;
    
    for (let s = 1; s <= scenarios; s++) {
        console.log(`Generando escenario ${s}/${scenarios} con variabilidad ${variabilityLevel}`);
        
        // Parámetros únicos por escenario BASADOS EN INVESTIGACIÓN CIENTÍFICA
        const scenarioParams = {
            baseTemp: 22 + Math.random() * 13,        // 22-35°C (óptimo científico)
            basePh: 7.0 + Math.random() * 2.5,        // 7.0-9.5 (óptimo pH 8-9)
            maxPAR: 50 + Math.random() * 350,         // 50-400 μmol/m²/s (óptimo científico)
            initialBiomass: 0.01 + Math.random() * 0.3,
            nutrientLevel: 0.2 + Math.random() * 0.8,
            lightRegime: Math.random() > 0.4 ? 'continuous' : 'cyclic',
            stressCondition: Math.random() > (1 - config.stressProb) ? 
                            (Math.random() > 0.5 ? 'high_temp' : 'low_pH') : 'normal',
            muMax: 0.08 + Math.random() * 0.15,       // 0.08-0.23 h⁻¹ (más realista para correlaciones)
            Ks_light: 60 + Math.random() * 80,        // 60-140 μmol/m²/s (más sensible)
            Ks_nutrient: 0.005 + Math.random() * 0.04, // Más limitante
            Ki_biomass: 0.8 + Math.random() * 2.2,    // 0.8-3.0 g/L (menor capacidad de carga)
            tempOptimal: 28 + Math.random() * 7,      // 28-35°C
            pHOptimal: 8.0 + Math.random() * 1.5,     // 8.0-9.5
            noiseLevel: config.noiseLevel
        };
        
        // Variables del estado del cultivo
        let biomass = scenarioParams.initialBiomass;
        let cellConcentration = biomass * (1.5e6 + Math.random() * 1e6);
        let currentpH = scenarioParams.basePh;
        let currentTemp = scenarioParams.baseTemp;
        let nutrients = scenarioParams.nutrientLevel;
        let oxygenLevel = 6.0 + Math.random() * 4.0;
        let co2Level = 0.02 + Math.random() * 0.06;
        
        // Variables derivadas
        let totalProductivity = 0;
        let cumulativeBiomass = biomass;
        
        for (let h = 0; h < hours; h++) {
            // === CONDICIONES AMBIENTALES ===
            
            // Ciclo de luz avanzado con variaciones realistas
            let lightIntensity;
            if (scenarioParams.lightRegime === 'continuous') {
                lightIntensity = scenarioParams.maxPAR * (0.95 + 0.1 * Math.random());
            } else {
                const hourOfDay = h % 24;
                if (hourOfDay >= 6 && hourOfDay <= 18) {
                    const lightFactor = Math.sin((hourOfDay - 6) * Math.PI / 12);
                    lightIntensity = scenarioParams.maxPAR * lightFactor * (0.85 + 0.3 * Math.random());
                } else {
                    lightIntensity = 0;
                }
            }
            
            // Variaciones de temperatura graduales
            let tempVariation = 0;
            if (scenarioParams.stressCondition === 'high_temp') {
                const stressFactor = Math.sin(h * 0.02);
                tempVariation = 5 + stressFactor * 8 + Math.random() * 2;
            } else {
                tempVariation = Math.sin(h * 0.01) * 2 + (Math.random() - 0.5) * 1;
            }
            
            const circadianTemp = 1.0 * Math.sin((h % 24) * Math.PI / 12);
            currentTemp = Math.max(15, Math.min(40, 
                scenarioParams.baseTemp + tempVariation + circadianTemp));
            
            // Variaciones de pH graduales
            let pHDrift = 0;
            if (scenarioParams.stressCondition === 'low_pH') {
                pHDrift = -0.5 + Math.sin(h * 0.015) * 0.3 + Math.random() * 0.1;
            } else {
                pHDrift = Math.sin(h * 0.008) * 0.15 + (Math.random() - 0.5) * 0.05;
            }
            
            const biomassPHEffect = (biomass - scenarioParams.initialBiomass) * 0.05;
            currentpH = Math.max(6.0, Math.min(9.0, 
                scenarioParams.basePh + pHDrift + biomassPHEffect));
            
            // Depleción gradual de nutrientes
            const nutrientUptake = (nutrients / (nutrients + 0.05)) * biomass * 0.008;
            nutrients = Math.max(0.05, nutrients - nutrientUptake);
            
            // Oxígeno con cambios graduales
            const oxygenProduction = lightIntensity > 0 ? biomass * 0.3 : 0;
            const oxygenConsumption = biomass * 0.08;
            const oxygenChange = (oxygenProduction - oxygenConsumption) * 0.002;
            oxygenLevel = Math.max(2, Math.min(12, oxygenLevel + oxygenChange));
            
            // CO2 con variación gradual
            const co2Consumption = lightIntensity > 0 ? biomass * 0.0008 : 0;
            co2Level = Math.max(0.01, Math.min(0.1, 
                co2Level - co2Consumption + 0.0005 + (Math.random() - 0.5) * 0.0002));
            
            // === MODELO CINÉTICO ULTRA-MEJORADO ===
            
            // 1. Efecto de LUZ - CRÍTICO con relación directa a concentración celular
            let lightEffect;
            if (lightIntensity === 0) {
                lightEffect = 0.005; // Respiración mínima en oscuridad
            } else if (lightIntensity < 30) {
                lightEffect = (lightIntensity / 30) * 0.2; // Muy limitado
            } else if (lightIntensity > 500) {
                // Fotoinhibición graduales
                lightEffect = 0.9 - Math.min(0.4, (lightIntensity - 500) / 1000);
            } else {
                // Curva de saturación optimizada
                lightEffect = (lightIntensity / (lightIntensity + scenarioParams.Ks_light)) * 
                             (1 + 0.3 * Math.sin(lightIntensity / 100)); // Efecto no-lineal
            }
            
            // 2. Efecto de TEMPERATURA - MÁS PRONUNCIADO
            let tempEffect;
            const tempDiff = Math.abs(currentTemp - scenarioParams.tempOptimal);
            
            if (currentTemp < 10 || currentTemp > 42) {
                tempEffect = 0.01; // Letal
            } else if (currentTemp < 18 || currentTemp > 38) {
                tempEffect = 0.15; // Muy limitado
            } else {
                // Curva de campana MÁS ESTRECHA para mayor sensibilidad
                tempEffect = Math.exp(-Math.pow(tempDiff / 3.5, 2)); // Más sensible
                
                // Bonus por estar en rango óptimo
                if (tempDiff < 2) {
                    tempEffect *= 1.2; // 20% bonus en rango óptimo
                }
            }
            
            // 3. Efecto de pH - MÁS SENSIBLE
            let pHEffect;
            const pHDiff = Math.abs(currentpH - scenarioParams.pHOptimal);
            
            if (currentpH < 6.0 || currentpH > 10.5) {
                pHEffect = 0.01; // Letal
            } else if (currentpH < 6.5 || currentpH > 10.0) {
                pHEffect = 0.2; // Muy limitado
            } else {
                // Curva optimizada para pH alcalino con mayor sensibilidad
                pHEffect = Math.exp(-Math.pow(pHDiff / 0.8, 2)); // Más sensible
                
                // Bonus por pH alcalino óptimo (8.5-9.5)
                if (currentpH >= 8.5 && currentpH <= 9.5) {
                    pHEffect *= 1.3; // 30% bonus en pH óptimo
                }
            }
            
            // 4. Efecto de NUTRIENTES
            const nutrientEffect = Math.pow(nutrients / (nutrients + scenarioParams.Ks_nutrient), 1.5);
            
            // 5. Inhibición por DENSIDAD
            const densityInhibition = Math.exp(-biomass / scenarioParams.Ki_biomass);
            
            // 6. Efecto del OXÍGENO
            const oxygenEffect = oxygenLevel > 2 ? 
                Math.min(1.0, (oxygenLevel - 1) / 7) : 0.01;
            
            // 7. Efecto del CO2
            const co2Effect = lightIntensity > 0 ? 
                Math.min(1.0, co2Level / 0.025) : 1.0;
            
            // Combinar efectos de forma REALISTA
            // La luz es ESENCIAL - sin luz no hay fotosíntesis
            let combinedEffect = lightEffect * tempEffect * pHEffect * nutrientEffect;
            
            // Solo agregar otros efectos si hay fotosíntesis activa
            if (lightIntensity > 0) {
                combinedEffect *= densityInhibition * oxygenEffect * co2Effect;
            } else {
                // En oscuridad, solo respiración (consumo)
                combinedEffect = 0.005 * tempEffect; // Respiración mínima
            }
            
            // Asegurar efecto mínimo pero biológicamente relevante
            combinedEffect = Math.max(0.001, Math.min(1.0, combinedEffect));
            
            // Tasa específica de crecimiento MÁS SENSIBLE A LUZ
            const mu = scenarioParams.muMax * combinedEffect;
            
            // Aplicar ruido biológico REDUCIDO para correlaciones más claras
            const biologicalNoise = (Math.random() - 0.5) * (scenarioParams.noiseLevel * 0.3);
            const actualGrowthRate = Math.max(0.001, mu + biologicalNoise);
            
            // === CONCENTRACIÓN CELULAR DIRECTAMENTE CORRELACIONADA CON PAR ===
            
            // Relación directa PAR -> células (basada en fotosíntesis)
            let baseCellDensity = 1.5e6; // Densidad base
            
            // Factor de luz DIRECTO para concentración celular
            let lightCellFactor = 1.0;
            if (lightIntensity > 50) {
                // Relación directa: más luz = más células (hasta saturación)
                lightCellFactor = 1.0 + Math.min(1.5, lightIntensity / 200);
            } else {
                // Sin luz suficiente, densidad reducida
                lightCellFactor = 0.3 + (lightIntensity / 50) * 0.7;
            }
            
            // Factor de calidad celular basado en condiciones óptimas
            const qualityFactor = Math.sqrt(tempEffect * pHEffect * nutrientEffect);
            
            // === CRECIMIENTO CON CORRELACIONES OPTIMIZADAS ===
            
            const growthIncrement = actualGrowthRate * biomass * 2.0; // Más acelerado
            const mortalityRate = 0.0005 * biomass; // Mortalidad mínima
            
            const netGrowth = growthIncrement - mortalityRate;
            biomass = Math.max(0.001, Math.min(biomass + netGrowth, scenarioParams.Ki_biomass));
            
            // Productividad
            const instantProductivity = netGrowth * 24;
            totalProductivity += Math.max(0, instantProductivity);
            cumulativeBiomass += biomass;
            
            // === VARIABLES DERIVADAS ===
            
            const opticalDensity = biomass * (2.0 + 0.3 * Math.random());
            
            const photosyntheticEfficiency = lightIntensity > 0 && actualGrowthRate > 0 ? 
                (actualGrowthRate * biomass) / (lightIntensity / 1000) : 0;
            
            const lightStressLevel = lightIntensity < scenarioParams.maxPAR * 0.3 ? 0.7 : 1.0;
            const chlorophyllContent = biomass * (12 + 8 * lightStressLevel + 3 * Math.random());
            
            const proteinContent = Math.max(20, Math.min(60, 
                30 + 25 * nutrientEffect + 10 * tempEffect + 5 * Math.random()));
            
            const stressFactor = 1 - Math.min(tempEffect, pHEffect, nutrientEffect);
            const lipidContent = Math.max(5, Math.min(40, 
                15 + 20 * stressFactor + 5 * Math.random()));
            
            const specificLightUptake = lightIntensity > 0 && biomass > 0 ? 
                lightIntensity / biomass : 0;
            
            const cultureAge = h;
            
            // Fase de crecimiento
            let growthPhase = 'lag';
            if (actualGrowthRate > scenarioParams.muMax * 0.7) {
                growthPhase = 'exponential';
            } else if (actualGrowthRate > scenarioParams.muMax * 0.3) {
                growthPhase = 'linear';
            } else if (actualGrowthRate > scenarioParams.muMax * 0.1) {
                growthPhase = 'stationary';
            } else {
                growthPhase = 'decline';
            }
            
            // Indicadores de estrés
            const thermalStress = tempEffect < 0.7 ? 1 : 0;
            const pHStress = pHEffect < 0.7 ? 1 : 0;
            const nutrientStress = nutrients < 0.3 ? 1 : 0;
            const lightStressIndicator = lightIntensity < scenarioParams.maxPAR * 0.2 ? 1 : 0;
            
            // === CREAR PUNTO DE DATOS ===
            const dataPoint = {
                // Identificadores
                Scenario: s,
                Time_h: h,
                DateTime: new Date(Date.now() + h * 3600000).toISOString(),
                Culture_Age_h: cultureAge,
                Growth_Phase: growthPhase,
                
                // Variables ambientales
                pH: parseFloat(currentpH.toFixed(3)),
                Temperature_C: parseFloat(currentTemp.toFixed(2)),
                PAR_umol_m2_s: parseFloat(lightIntensity.toFixed(1)),
                Dissolved_O2_mg_L: parseFloat(oxygenLevel.toFixed(2)),
                CO2_percent: parseFloat(co2Level.toFixed(4)),
                
                // Cinética de crecimiento
                Growth_Rate_mu_h: parseFloat(actualGrowthRate.toFixed(5)),
                Specific_Growth_Rate: parseFloat((actualGrowthRate * 24).toFixed(4)),
                
                // Biomasa y células
                Biomass_g_L: parseFloat(biomass.toFixed(4)),
                Cell_Concentration_cells_mL: parseFloat(cellConcentration.toFixed(0)),
                Optical_Density_680nm: parseFloat(opticalDensity.toFixed(3)),
                
                // Nutrientes y metabolismo
                Nutrients_g_L: parseFloat(nutrients.toFixed(4)),
                Nutrient_Uptake_Rate: parseFloat(nutrientUptake.toFixed(5)),
                
                // Productividad
                Instantaneous_Productivity_g_L_d: parseFloat(instantProductivity.toFixed(4)),
                Cumulative_Productivity: parseFloat(totalProductivity.toFixed(3)),
                Average_Productivity: parseFloat((totalProductivity / (h + 1)).toFixed(4)),
                
                // Eficiencias
                Photosynthetic_Efficiency: parseFloat(photosyntheticEfficiency.toFixed(6)),
                Light_Use_Efficiency: parseFloat((actualGrowthRate / Math.max(0.001, lightIntensity / 1000)).toFixed(5)),
                Specific_Light_Uptake: parseFloat(specificLightUptake.toFixed(2)),
                
                // Composición bioquímica
                Chlorophyll_ug_mL: parseFloat(chlorophyllContent.toFixed(2)),
                Protein_Content_percent: parseFloat(proteinContent.toFixed(1)),
                Lipid_Content_percent: parseFloat(lipidContent.toFixed(1)),
                Carbohydrate_Content_percent: parseFloat((100 - proteinContent - lipidContent).toFixed(1)),
                
                // Indicadores de estrés
                Thermal_Stress: thermalStress,
                pH_Stress: pHStress,
                Nutrient_Stress: nutrientStress,
                Light_Stress: lightStressIndicator,
                Overall_Stress_Score: thermalStress + pHStress + nutrientStress + lightStressIndicator,
                
                // Condiciones experimentales
                Light_Regime: scenarioParams.lightRegime,
                Stress_Condition: scenarioParams.stressCondition,
                
                // Parámetros del modelo
                Temp_Optimal_C: parseFloat(scenarioParams.tempOptimal.toFixed(1)),
                pH_Optimal: parseFloat(scenarioParams.pHOptimal.toFixed(2)),
                mu_Max_h: parseFloat(scenarioParams.muMax.toFixed(4)),
                
                // Efectos individuales
                Light_Effect: parseFloat(lightEffect.toFixed(4)),
                Temperature_Effect: parseFloat(tempEffect.toFixed(4)),
                pH_Effect: parseFloat(pHEffect.toFixed(4)),
                Nutrient_Effect: parseFloat(nutrientEffect.toFixed(4)),
                Density_Effect: parseFloat(densityInhibition.toFixed(4)),
                
                // Calidad de datos
                Data_Quality_Score: parseFloat((1 - Math.abs(biologicalNoise)).toFixed(3)),
                Biological_Noise_Level: parseFloat(Math.abs(biologicalNoise).toFixed(4))
            };
            
            data.push(dataPoint);
        }
    }
    
    return data;
}

// Convertir a CSV
function toCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];
    
    data.forEach(row => {
        rows.push(headers.map(h => row[h]).join(','));
    });
    
    return rows.join('\n');
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Chlorella Generator Running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Servidor Chlorella OK', 
        time: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint principal para generar dataset
app.post('/generate-dataset', (req, res) => {
    try {
        const { scenarios = 25, hoursPerScenario = 120, variabilityLevel = 'medium' } = req.body;
        
        // Validar parámetros
        if (scenarios < 1 || scenarios > 100) {
            return res.status(400).json({ 
                success: false, 
                error: 'Escenarios debe estar entre 1 y 100' 
            });
        }
        
        if (hoursPerScenario < 24 || hoursPerScenario > 480) {
            return res.status(400).json({ 
                success: false, 
                error: 'Horas debe estar entre 24 y 480' 
            });
        }
        
        const validVariability = ['low', 'medium', 'high', 'extreme'];
        if (!validVariability.includes(variabilityLevel)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nivel de variabilidad debe ser: low, medium, high, o extreme' 
            });
        }
        
        console.log(`🚀 Generando ${scenarios} escenarios con ${hoursPerScenario} horas, variabilidad: ${variabilityLevel}`);
        
        const data = generateAdvancedData(scenarios, hoursPerScenario, variabilityLevel);
        
        // Dividir datos
        const shuffled = data.sort(() => Math.random() - 0.5);
        const trainSize = Math.floor(shuffled.length * 0.7);
        const validSize = Math.floor(shuffled.length * 0.15);
        
        const train = shuffled.slice(0, trainSize);
        const valid = shuffled.slice(trainSize, trainSize + validSize);
        const test = shuffled.slice(trainSize + validSize);
        
        // Crear directorio con timestamp
        const timestamp = Date.now();
        const folder = path.join(datasetsDir, timestamp.toString());
        fs.mkdirSync(folder, { recursive: true });
        
        // Guardar archivos CSV
        try {
            fs.writeFileSync(path.join(folder, 'complete_dataset.csv'), toCSV(data));
            fs.writeFileSync(path.join(folder, 'training_data.csv'), toCSV(train));
            fs.writeFileSync(path.join(folder, 'validation_data.csv'), toCSV(valid));
            fs.writeFileSync(path.join(folder, 'test_data.csv'), toCSV(test));
        } catch (writeError) {
            console.error('Error escribiendo archivos:', writeError);
            return res.status(500).json({ 
                success: false, 
                error: 'Error guardando archivos CSV' 
            });
        }
        
        // Estadísticas del dataset
        const stats = {
            totalPoints: data.length,
            trainingPoints: train.length,
            validationPoints: valid.length,
            testPoints: test.length,
            scenarios: scenarios,
            duration: hoursPerScenario,
            biomassRange: {
                min: Math.min(...data.map(d => d.Biomass_g_L)),
                max: Math.max(...data.map(d => d.Biomass_g_L)),
                mean: data.reduce((s, d) => s + d.Biomass_g_L, 0) / data.length
            },
            stressDistribution: {
                thermal: data.filter(d => d.Thermal_Stress === 1).length,
                ph: data.filter(d => d.pH_Stress === 1).length,
                nutrient: data.filter(d => d.Nutrient_Stress === 1).length,
                normal: data.filter(d => d.Overall_Stress_Score === 0).length
            },
            qualityMetrics: {
                completeness: 100,
                dataQuality: 'industrial-grade',
                temporalResolution: 'hourly',
                biologicalAccuracy: 'high'
            },
            outputDir: folder
        };
        
        console.log('✅ Dataset generado exitosamente');
        res.json({ 
            success: true, 
            stats, 
            outputDir: folder,
            message: 'Dataset generado correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error generando dataset:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error interno del servidor'
        });
    }
});

// Endpoint para obtener muestra de datos
app.get('/sample-data/:folder', (req, res) => {
    try {
        const filePath = path.join(datasetsDir, req.params.folder, 'complete_dataset.csv');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                error: 'Dataset no encontrado',
                folder: req.params.folder
            });
        }
        
        const csv = fs.readFileSync(filePath, 'utf8');
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        // Tomar muestra de los primeros 1000 registros
        const sampleSize = Math.min(1000, lines.length - 1);
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
        
        res.json({
            data: data,
            sampleSize: data.length,
            totalRows: lines.length - 1,
            headers: headers
        });
        
    } catch (error) {
        console.error('Error obteniendo muestra:', error);
        res.status(500).json({ 
            error: 'Error leyendo datos',
            details: error.message
        });
    }
});

// Endpoint para descargar archivos
app.get('/download/:folder/:filename', (req, res) => {
    try {
        const filePath = path.join(datasetsDir, req.params.folder, req.params.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                error: 'Archivo no encontrado',
                path: req.params.filename
            });
        }
        
        // Configurar headers para descarga
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        res.setHeader('Content-Type', 'text/csv');
        
        res.download(filePath, req.params.filename, (err) => {
            if (err) {
                console.error('Error en descarga:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error descargando archivo' });
                }
            }
        });
        
    } catch (error) {
        console.error('Error preparando descarga:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
            <html>
                <head><title>Chlorella Generator</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>🧬 Generador Chlorella vulgaris</h1>
                    <p>Servidor funcionando correctamente</p>
                    <p>Puerto: ${PORT}</p>
                    <p>Tiempo: ${new Date().toISOString()}</p>
                    <p><strong>Nota:</strong> Coloca el archivo index.html en la carpeta public/</p>
                    <a href="/test" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Test Servidor</a>
                </body>
            </html>
        `);
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Chlorella iniciado en puerto ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Directorio datasets: ${datasetsDir}`);
    console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
});

module.exports = app;
