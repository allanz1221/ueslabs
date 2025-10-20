# Gestión Completa de Usuarios

Este documento explica cómo usar el sistema completo de administración de usuarios en el panel de administración.

## 🎯 Funcionalidades Principales

El panel de administración de usuarios (`/admin/users`) permite:

- ✅ **Ver todos los usuarios** del sistema organizados por pestañas
- ✅ **Editar información completa** de cada usuario
- ✅ **Cambiar roles** (Estudiante, Administrador, Responsable de Laboratorio, Profesor)
- ✅ **Asignar programas educativos** (Mecatrónica/Manufactura)
- ✅ **Asignar laboratorios** a responsables (Lab-Elect/Lab-Ing)
- ✅ **Gestionar matrículas** y nombres de usuarios
- ✅ **Carga masiva** de usuarios mediante CSV

## 🔧 Acceso al Panel

### Requisitos:
- **Rol**: Solo usuarios con rol `ADMIN` pueden acceder
- **URL**: `/admin/users`

### Navegación:
1. Login como administrador
2. Ir a **Admin → Usuarios** en el menú lateral

## 📋 Estructura del Panel

### Pestañas Disponibles:
- **Todos**: Vista completa de todos los usuarios
- **Estudiantes**: Solo usuarios con rol `STUDENT`
- **Administradores**: Solo usuarios con rol `ADMIN`

### Información Mostrada por Usuario:
- **Nombre completo**
- **Correo electrónico**
- **Rol actual** con badge visual
- **Matrícula** (si aplica)
- **Programa educativo** (Mecatrónica/Manufactura)
- **Laboratorio asignado** (solo para responsables)

## ✏️ Editar Usuario

### Cómo Editar:
1. Hacer clic en el botón **"Editar"** junto al usuario deseado
2. Se abrirá un modal con todos los campos editables
3. Modificar la información necesaria
4. Hacer clic en **"Guardar Cambios"**

### Campos Editables:

#### 📝 **Información General**
- **Nombre Completo**: Nombre y apellidos del usuario
- **Correo Electrónico**: Email (solo lectura para seguridad)
- **Matrícula**: Número de identificación estudiantil

#### 👤 **Rol del Usuario**
Opciones disponibles:
- **Estudiante**: Acceso básico al sistema
- **Administrador**: Acceso total al sistema
- **Responsable de Laboratorio**: Gestión específica de laboratorio
- **Profesor**: Funcionalidades de docente

#### 🎓 **Programa Educativo**
Para **todos los usuarios**:
- **Mecatrónica**: Programa de Ingeniería Mecatrónica
- **Manufactura**: Programa de Manufactura
- **Sin programa**: Para usuarios que no pertenecen a ningún programa

#### 🔬 **Laboratorio Asignado**
Solo para **Responsables de Laboratorio**:
- **Lab-Elect**: Laboratorio de Electrónica
- **Lab-Ing**: Laboratorio de Ingeniería
- **Sin asignar**: Sin laboratorio específico

## 🔄 Flujos de Trabajo Comunes

### 1. **Convertir Estudiante en Responsable de Laboratorio**

**Pasos:**
1. Buscar al usuario en la lista
2. Hacer clic en **"Editar"**
3. Cambiar **Rol** a "Responsable de Laboratorio"
4. Seleccionar **Laboratorio Asignado** (Lab-Elect o Lab-Ing)
5. Asignar **Programa Educativo** si corresponde
6. Guardar cambios

**Resultado:** El usuario podrá gestionar solo materiales y préstamos de su laboratorio asignado.

### 2. **Asignar Programa Educativo a Estudiantes**

**Pasos:**
1. Ir a la pestaña **"Estudiantes"**
2. Hacer clic en **"Editar"** junto al estudiante
3. Seleccionar **Programa Educativo** (Mecatrónica/Manufactura)
4. Actualizar **Matrícula** si es necesario
5. Guardar cambios

**Resultado:** El estudiante aparecerá asociado al programa correcto en reportes y estadísticas.

### 3. **Crear Nuevo Administrador**

**Pasos:**
1. El usuario debe registrarse primero en `/auth/register`
2. Una vez registrado, editarlo desde el panel
3. Cambiar **Rol** a "Administrador"
4. Asignar **Programa Educativo** si corresponde
5. Guardar cambios

**Resultado:** El usuario tendrá acceso completo al panel de administración.

## 📊 Carga Masiva de Usuarios

### Formato CSV Requerido:
```csv
email,full_name,student_id,role,program
estudiante1@universidad.edu,Juan Pérez,2024001,STUDENT,MECATRONICA
estudiante2@universidad.edu,María García,2024002,STUDENT,MANUFACTURA
responsable@universidad.edu,Carlos López,LAB001,LAB_MANAGER,MECATRONICA
```

### Pasos:
1. Hacer clic en **"Carga Masiva"**
2. Descargar la **"Plantilla CSV"** como referencia
3. Completar el archivo CSV con los datos
4. Subir el archivo mediante el formulario
5. Revisar los resultados de la importación

### Campos del CSV:
- **email**: Correo electrónico único
- **full_name**: Nombre completo
- **student_id**: Matrícula (opcional)
- **role**: STUDENT, ADMIN, LAB_MANAGER, PROFESSOR
- **program**: MECATRONICA, MANUFACTURA (opcional)

## 🔐 Permisos y Seguridad

### Restricciones:
- Solo administradores pueden editar usuarios
- El email no se puede modificar por seguridad
- Los laboratorios solo se asignan a responsables
- Los cambios se registran en logs del sistema

### Validaciones:
- Roles válidos según enum de la base de datos
- Programas válidos (MECATRONICA, MANUFACTURA)
- Laboratorios válidos (LAB_ELECT, LAB_ING)
- Emails únicos en el sistema

## 📈 Casos de Uso por Rol

### **Estudiante** → **Responsable de Lab-Elect**
```
Cambios necesarios:
- Rol: STUDENT → LAB_MANAGER
- Laboratorio Asignado: → LAB_ELECT
- Programa: Mantener actual

Resultado:
- Solo ve materiales de Lab-Elect
- Solo gestiona préstamos de Lab-Elect
- No puede crear materiales de Lab-Ing
```

### **Usuario Nuevo** → **Administrador**
```
Cambios necesarios:
- Rol: STUDENT → ADMIN
- Programa: Asignar si corresponde
- Matrícula: Limpiar si no aplica

Resultado:
- Acceso total al sistema
- Puede gestionar todos los laboratorios
- Puede editar todos los usuarios
```

### **Estudiante** → **Asignar Programa Educativo**
```
Cambios necesarios:
- Programa: → MECATRONICA o MANUFACTURA
- Matrícula: Verificar formato
- Rol: Mantener STUDENT

Resultado:
- Aparece en reportes del programa
- Filtros por programa funcionan
- Estadísticas correctas
```

## 🛠️ Solución de Problemas

### **Error: "No se pudo actualizar el usuario"**
- Verificar que eres administrador
- Revisar que el email no esté duplicado
- Confirmar que los valores son válidos

### **Laboratorio no se guarda**
- Solo disponible para rol "Responsable de Laboratorio"
- Cambiar primero el rol, luego asignar laboratorio

### **Programa no aparece**
- Verificar que se seleccionó en el dropdown
- Confirmar que se guardaron los cambios
- Recargar la página si es necesario

### **CSV no se procesa**
- Verificar formato de columnas
- Confirmar que los emails son únicos
- Revisar que los roles sean válidos (mayúsculas)

## 📋 Checklist de Configuración Inicial

### Para configurar usuarios desde cero:

1. **Administradores**
   - [ ] Cambiar rol a ADMIN
   - [ ] Verificar acceso al panel
   - [ ] Asignar programa si corresponde

2. **Responsables de Laboratorio**
   - [ ] Cambiar rol a LAB_MANAGER
   - [ ] Asignar laboratorio (LAB_ELECT o LAB_ING)
   - [ ] Verificar permisos de gestión
   - [ ] Probar creación de materiales

3. **Estudiantes**
   - [ ] Verificar rol STUDENT
   - [ ] Asignar programa educativo
   - [ ] Completar matrícula
   - [ ] Probar acceso a solicitudes

4. **Profesores**
   - [ ] Cambiar rol a PROFESSOR
   - [ ] Asignar programa correspondiente
   - [ ] Verificar acceso a funcionalidades

---

**¡Con este sistema completo de gestión de usuarios, tendrás control total sobre roles, permisos y asignaciones en tu sistema de laboratorios!**