# Configuración del Usuario Administrador

## Crear el Primer Administrador

Para crear el primer usuario administrador del sistema, sigue estos pasos:

### Opción 1: Registro Manual + Promoción

1. **Registra un usuario normal** en la aplicación:
   - Ve a `/auth/register`
   - Usa el correo: `admin@laboratorio.edu`
   - Usa una contraseña segura (ej: `Admin123!`)
   - Completa el registro

2. **Verifica el correo electrónico** (revisa tu bandeja de entrada)

3. **Ejecuta el script SQL** para promover el usuario a administrador:
   ```sql
   -- Opción A: Usando la función
   select promote_to_admin('admin@laboratorio.edu');
   
   -- Opción B: Actualización directa
   update public.profiles 
   set role = 'admin', full_name = 'Administrador del Sistema'
   where email = 'admin@laboratorio.edu';
   ```

### Opción 2: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** > **Users**
3. Crea un nuevo usuario con el correo `admin@laboratorio.edu`
4. Ve a **Table Editor** > **profiles**
5. Encuentra el perfil del usuario recién creado
6. Cambia el campo `role` de `student` a `admin`

## Gestión de Usuarios

Una vez que tengas acceso como administrador:

### Agregar Usuarios Individuales

1. Ve a `/admin/users`
2. Haz clic en **"Agregar Usuario"**
3. Completa el formulario con los datos del usuario
4. Selecciona el rol (Estudiante o Administrador)

**Nota:** Los usuarios deben completar el registro usando el formulario de registro. Luego puedes cambiar su rol desde el panel de administración.

### Carga Masiva de Usuarios (CSV)

1. Ve a `/admin/users`
2. Haz clic en **"Carga Masiva"**
3. Descarga la plantilla CSV haciendo clic en **"Descargar Plantilla CSV"**
4. Completa la plantilla con los datos de los usuarios:
   ```csv
   email,full_name,student_id,role,program
   estudiante1@universidad.edu,Juan Pérez,2024001,student,mecatronica
   estudiante2@universidad.edu,María García,2024002,student,manufactura
   admin2@universidad.edu,Carlos Admin,ADMIN02,admin,
   labmanager@universidad.edu,Ana Responsable,,lab_manager,mecatronica
   profesor@universidad.edu,Luis Profesor,,professor,manufactura
   ```
5. Sube el archivo CSV completado

**Formato del CSV:**
- **email**: Correo electrónico del usuario (requerido)
- **full_name**: Nombre completo (requerido)
- **student_id**: Matrícula o ID del estudiante (opcional)
- **role**: `student`, `admin`, `lab_manager`, `professor` (por defecto: `student`)
- **program**: `mecatronica` o `manufactura` (opcional; requerido para `lab_manager` y `professor`)

### Cambiar Roles de Usuarios

1. Ve a `/admin/users`
2. Encuentra el usuario en la lista
3. Usa el selector de rol para cambiar entre "Estudiante" y "Administrador"
4. El cambio se aplica inmediatamente

## Credenciales Recomendadas

Para el primer administrador, se recomienda:

- **Email:** `admin@laboratorio.edu` (o el dominio de tu institución)
- **Contraseña:** Usa una contraseña segura con al menos:
  - 8 caracteres
  - Mayúsculas y minúsculas
  - Números
  - Caracteres especiales

**⚠️ IMPORTANTE:** Cambia la contraseña después del primer inicio de sesión.

## Seguridad

- Los usuarios solo pueden ver y modificar sus propios datos
- Los administradores tienen acceso completo al sistema
- Todas las tablas están protegidas con Row Level Security (RLS)
- Las contraseñas se almacenan de forma segura en Supabase Auth

## Solución de Problemas

### No puedo acceder como administrador

1. Verifica que el usuario esté registrado en Supabase Auth
2. Confirma que el campo `role` en la tabla `profiles` sea `admin`
3. Cierra sesión y vuelve a iniciar sesión
4. Limpia la caché del navegador si es necesario

### El script SQL no funciona

Asegúrate de que:
- El script `005_create_admin_user.sql` se haya ejecutado correctamente
- El usuario ya esté registrado en el sistema
- Estés usando el correo electrónico correcto
