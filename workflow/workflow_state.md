# Estado del Flujo de Trabajo - CompeteZone E2E Testing

## Estado Actual
- **Fase**: ANALYZE
- **Estado**: READY
- **Tarea Actual**: [Se establecerá automáticamente]
- **Proyecto**: E2E Testing (compete-zone-e2e)

## Plan
[Se generará durante la fase BLUEPRINT]

## Reglas del Flujo de Trabajo

### Fases del Trabajo
1. **ANALYZE**: Entender el requerimiento de testing y contexto
2. **BLUEPRINT**: Crear plan detallado paso a paso para tests
3. **CONSTRUCT**: Implementar tests siguiendo el plan
4. **VALIDATE**: Ejecutar y validar los tests

### Reglas de Herramientas Testing
- **Entorno**: Ejecutar `docker-compose -f docker-compose.e2e.yml up -d`
- **Tests**: Ejecutar `npx playwright test` para todos los tests
- **Tests Específicos**: `npx playwright test tests/e2e/auth/`
- **UI Mode**: `npx playwright test --ui` para debugging
- **Reports**: `npx playwright show-report` para ver reportes

### Manejo de Errores Testing
- Si fallan tests: analizar screenshots y videos
- Si hay problemas de entorno: verificar Docker Compose
- Si hay timeouts: ajustar configuraciones de espera
- Si hay datos inconsistentes: verificar fixtures y cleanup

### Gestión de Datos de Prueba
- Verificar que fixtures estén actualizados
- Mantener consistencia en datos de prueba
- Documentar cambios en fixtures
- Validar que cleanup funcione correctamente

### Tests y Cobertura
- Seguir patrones de Page Objects
- Mantener tests independientes
- Validar flujos completos de usuario
- Probar casos edge y errores

### Integración con Otros Proyectos
- Verificar que API esté funcionando
- Validar que frontend esté accesible
- Probar integración completa
- Mantener sincronización con cambios

### Reporting y Análisis
- Generar reportes HTML
- Analizar resultados con scripts
- Documentar flaky tests
- Mantener métricas de calidad

## Log
[Se actualizará automáticamente durante el trabajo]

### Patrones Aprendidos
- [Se documentarán patrones específicos de testing]

### Decisiones Técnicas
- [Se registrarán decisiones importantes]

### Tests Fallecidos
- [Se registrarán tests que necesiten atención]

### Mejoras de Performance
- [Se registrarán optimizaciones de tests]
