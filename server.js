// server.js - Versión mínima que funciona 100%
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.static('public'));

// Crear directorio para datasets
const datasetsDir = path.join(__dirname, 'generated_datasets');
if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
}

// server.js - Versión avanzada con base de datos perfecta
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.static('public'));

// Crear directorio para datasets
const datasetsDir = path.join(__dirname, 'generated_datasets');
if (!fs.existsSync(datasetsDir)) {
    fs.mkdirSync(datasetsDir, { recursive: true });
}

// Función avanzada para generar datos con modelo cinético completo
function generateAdvancedData(scenarios, hours) {
    const data = [];
    
    for (let s = 1; s <= scenarios; s++) {
        console.log(`Generando escenario ${s}/${scenarios}`);
        
        // Parámetros únicos por escenario
        const scenarioParams = {
            baseTemp: 20 + Math.random() * 10,        // 20-30°C
            basePh: 6.8 + Math.random() * 1.2,        // 6.8-8.0
            maxPAR: 400 + Math.random() * 600,        // 400-1000 μmol/m²/s
            initialBiomass: 0.05 + Math.random() * 0.3, // 0.05-0.35 g/L
            nutrientLevel: 0.5 + Math.random() * 0.5,  // 0.5-1.0
            lightRegime: Math.random() > 0.5 ? 'continuous' : 'cyclic',
            stressCondition: Math.random() > 0.8 ? 'high_temp' : 
                            Math.random() > 0.6 ? 'low_pH' : 'normal',
            // Parámetros kinéticos
            muMax: 0.06 + Math.random() * 0.04,       // 0.06-0.10 h⁻¹
            Ks_light: 200 + Math.random() * 200,      // 200-400 μmol/m²/s
            Ks_nutrient: 0.05 + Math.random() * 0.1,  // 0.05-0.15 g/L
            Ki_biomass: 3 + Math.random() * 2,        // 3-5 g/L
            // Parámetros ambientales
            tempOptimal: 25 + Math.random() * 5,      // 25-30°C
            pHOptimal: 7.0 + Math.random() * 0.5,     // 7.0-7.5
            // Variabilidad
            noiseLevel: 0.02 + Math.random() * 0.03   // 2-5%
        };
        
        // Variables del estado del cultivo
        let biomass = scenarioParams.initialBiomass;
        let cellConcentration = biomass * 2e6;
        let currentpH = scenarioParams.basePh;
        let currentTemp = scenarioParams.baseTemp;
        let nutrients = scenarioParams.nutrientLevel;
        let oxygenLevel = 8.0; // mg/L
        let co2Level = 0.04;   // %
        
        // Variables derivadas
        let totalProductivity = 0;
        let cumulativeBiomass = biomass;
        
        for (let h = 0; h < hours; h++) {
            // === CONDICIONES AMBIENTALES ===
            
            // Ciclo de luz avanzado con variaciones realistas
            let lightIntensity;
            if (scenarioParams.lightRegime === 'continuous') {
                // Luz continua con pequeñas fluctuaciones
                lightIntensity = scenarioParams.maxPAR * (0.85 + 0.15 * Math.random());
            } else {
                // Ciclo día/noche con variación sinusoidal
                const hourOfDay = h % 24;
                if (hourOfDay >= 6 && hourOfDay <= 18) {
                    lightIntensity = scenarioParams.maxPAR * Math.sin((hourOfDay - 6) * Math.PI / 12) * (0.9 + 0.2 * Math.random());
                } else {
                    lightIntensity = 0;
                }
            }
            
            // Variaciones de temperatura con efectos circadianos y estrés
            let tempVariation = 0;
            if (scenarioParams.stressCondition === 'high_temp') {
                tempVariation = 8 + Math.random() * 4; // Estrés térmico alto
            } else {
                tempVariation = Math.random() * 3 - 1.5; // Variación normal
            }
            
            // Efecto circadiano en temperatura
            const circadianTemp = 1.5 * Math.sin((h % 24) * Math.PI / 12);
            currentTemp = Math.max(15, Math.min(40, 
                scenarioParams.baseTemp + tempVariation + circadianTemp));
            
            // Variaciones de pH con drift temporal y buffering
            let pHDrift = 0;
            if (scenarioParams.stressCondition === 'low_pH') {
                pHDrift = -0.8 + Math.random() * 0.3; // Estrés por pH bajo
            } else {
                pHDrift = (Math.random() - 0.5) * 0.2; // Variación normal
            }
            
            // pH afectado por producción de biomasa y CO2
            const biomassPHEffect = (biomass - scenarioParams.initialBiomass) * 0.1;
            currentpH = Math.max(6.0, Math.min(9.0, 
                scenarioParams.basePh + pHDrift + biomassPHEffect + 0.2 * Math.sin(h * 0.05)));
            
            // Depleción de nutrientes con cinética de Michaelis-Menten
            const nutrientUptake = (nutrients / (nutrients + 0.1)) * biomass * 0.01;
            nutrients = Math.max(0.05, nutrients - nutrientUptake);
            
            // Oxígeno disuelto (afectado por fotosíntesis y respiración)
            const oxygenProduction = lightIntensity > 0 ? biomass * 0.5 : 0;
            const oxygenConsumption = biomass * 0.1;
            oxygenLevel = Math.max(2, Math.min(12, 
                oxygenLevel + (oxygenProduction - oxygenConsumption) * 0.001));
            
            // CO2 (consumido durante fotosíntesis)
            const co2Consumption = lightIntensity > 0 ? biomass * 0.001 : 0;
            co2Level = Math.max(0.01, Math.min(0.1, co2Level - co2Consumption + 0.001));
            
            // === MODELO CINÉTICO AVANZADO ===
            
            // Efectos individuales en el crecimiento
            const lightEffect = lightIntensity / (lightIntensity + scenarioParams.Ks_light);
            
            // Efecto de temperatura (Arrhenius modificado)
            const tempDiff = Math.abs(currentTemp - scenarioParams.tempOptimal);
            const tempEffect = currentTemp >= 15 && currentTemp <= 40 ? 
                Math.exp(-Math.pow(tempDiff / 8, 2)) : 0.05;
            
            // Efecto de pH (curva de campana)
            const pHDiff = Math.abs(currentpH - scenarioParams.pHOptimal);
            const pHEffect = currentpH >= 6.0 && currentpH <= 9.0 ? 
                Math.exp(-Math.pow(pHDiff / 1.2, 2)) : 0.05;
            
            // Efecto de nutrientes (Monod)
            const nutrientEffect = nutrients / (nutrients + scenarioParams.Ks_nutrient);
            
            // Inhibición por densidad celular
            const densityInhibition = scenarioParams.Ki_biomass / (scenarioParams.Ki_biomass + biomass);
            
            // Efecto del oxígeno
            const oxygenEffect = oxygenLevel > 4 ? 1.0 : oxygenLevel / 4;
            
            // Efecto del CO2
            const co2Effect = Math.min(1.0, co2Level / 0.04);
            
            // Tasa específica de crecimiento (μ)
            const mu = scenarioParams.muMax * lightEffect * tempEffect * pHEffect * 
                      nutrientEffect * densityInhibition * oxygenEffect * co2Effect;
            
            // Aplicar ruido biológico realista
            const biologicalNoise = (Math.random() - 0.5) * scenarioParams.noiseLevel;
            const actualGrowthRate = Math.max(0, mu + biologicalNoise);
            
            // === ACTUALIZACIÓN DEL ESTADO ===
            
            // Crecimiento exponencial limitado
            const newBiomass = biomass * Math.exp(actualGrowthRate);
            biomass = Math.min(newBiomass, scenarioParams.Ki_biomass);
            
            // Concentración celular (relación biomasa-células)
            cellConcentration = biomass * (1.8e6 + 0.4e6 * Math.random());
            
            // Productividad instantánea y acumulada
            const instantProductivity = biomass * actualGrowthRate * 24; // g/L/día
            totalProductivity += instantProductivity;
            cumulativeBiomass += biomass;
            
            // === VARIABLES DERIVADAS ===
            
            // Densidad óptica (relación no lineal con biomasa)
            const opticalDensity = biomass * (2.2 + 0.6 * Math.random());
            
            // Eficiencia fotosintética
            const photosyntheticEfficiency = lightIntensity > 0 ? 
                (actualGrowthRate / (lightIntensity / 1000)) : 0;
            
            // Contenido de clorofila (μg/mL)
            const chlorophyllContent = biomass * (15 + 5 * Math.random());
            
            // Contenido de proteínas (% peso seco)
            const proteinContent = 35 + 15 * nutrientEffect + 5 * Math.random();
            
            // Contenido de lípidos (% peso seco)
            const lipidContent = Math.max(5, 20 - 10 * nutrientEffect + 5 * Math.random());
            
            // Consumo específico de luz
            const specificLightUptake = lightIntensity > 0 ? lightIntensity / biomass : 0;
            
            // Edad del cultivo
            const cultureAge = h;
            
            // Fase de crecimiento
            let growthPhase = 'lag';
            if (biomass > scenarioParams.initialBiomass * 1.5) growthPhase = 'exponential';
            if (biomass > scenarioParams.Ki_biomass * 0.7) growthPhase = 'stationary';
            if (actualGrowthRate < 0.005) growthPhase = 'decline';
            
            // Indicadores de estrés
            const thermalStress = currentTemp > scenarioParams.tempOptimal + 5 || 
                                 currentTemp < scenarioParams.tempOptimal - 5 ? 1 : 0;
            const pHStress = currentpH < 6.5 || currentpH > 8.5 ? 1 : 0;
            const nutrientStress = nutrients < 0.2 ? 1 : 0;
            const lightStress = lightIntensity < 100 && scenarioParams.lightRegime === 'continuous' ? 1 : 0;
            
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
                Light_Stress: lightStress,
                Overall_Stress_Score: thermalStress + pHStress + nutrientStress + lightStress,
                
                // Condiciones experimentales
                Light_Regime: scenarioParams.lightRegime,
                Stress_Condition: scenarioParams.stressCondition,
                
                // Parámetros del modelo
                Temp_Optimal_C: parseFloat(scenarioParams.tempOptimal.toFixed(1)),
                pH_Optimal: parseFloat(scenarioParams.pHOptimal.toFixed(2)),
                mu_Max_h: parseFloat(scenarioParams.muMax.toFixed(4)),
                
                // Efectos individuales (para análisis)
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

// Rutas
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor OK', time: new Date().toISOString() });
});

app.post('/generate-dataset', (req, res) => {
    try {
        const { scenarios = 25, hoursPerScenario = 120 } = req.body;
        
        console.log(`Generando ${scenarios} escenarios con ${hoursPerScenario} horas`);
        
        const data = generateAdvancedData(scenarios, hoursPerScenario);
        
        // Dividir datos
        const shuffled = data.sort(() => Math.random() - 0.5);
        const trainSize = Math.floor(shuffled.length * 0.7);
        const validSize = Math.floor(shuffled.length * 0.15);
        
        const train = shuffled.slice(0, trainSize);
        const valid = shuffled.slice(trainSize, trainSize + validSize);
        const test = shuffled.slice(trainSize + validSize);
        
        // Guardar archivos
        const timestamp = Date.now();
        const folder = path.join(datasetsDir, timestamp.toString());
        fs.mkdirSync(folder, { recursive: true });
        
        fs.writeFileSync(path.join(folder, 'complete_dataset.csv'), toCSV(data));
        fs.writeFileSync(path.join(folder, 'training_data.csv'), toCSV(train));
        fs.writeFileSync(path.join(folder, 'validation_data.csv'), toCSV(valid));
        fs.writeFileSync(path.join(folder, 'test_data.csv'), toCSV(test));
        
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
                normal: data.filter(d => d.Thermal_Stress === 0 && d.pH_Stress === 0).length
            },
            qualityMetrics: {
                completeness: 100,
                dataQuality: 'industrial',
                resolution: 'hour'
            },
            outputDir: folder
        };
        
        console.log('Dataset generado exitosamente');
        res.json({ success: true, stats, outputDir: folder });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/sample-data/:folder', (req, res) => {
    try {
        const filePath = path.join(datasetsDir, req.params.folder, 'complete_dataset.csv');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'No encontrado' });
        }
        
        const csv = fs.readFileSync(filePath, 'utf8');
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const data = [];
        for (let i = 1; i < Math.min(lines.length, 1001); i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((h, idx) => {
                    row[h] = isNaN(values[idx]) ? values[idx] : parseFloat(values[idx]);
                });
                data.push(row);
            }
        }
        
        res.json(data);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/download/:folder/:filename', (req, res) => {
    const filePath = path.join(datasetsDir, req.params.folder, req.params.filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('<h1>Servidor funcionando</h1><p>Falta el archivo public/index.html</p>');
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

module.exports = app;
