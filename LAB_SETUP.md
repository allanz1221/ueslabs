# Configuración del Sistema de Laboratorios

Este documento explica cómo activar completamente el sistema de gestión por laboratorios (Lab-Elect y Lab-Ing) en el sistema de préstamos.

## 🚀 Estado Actual

✅ **Funcionalidades Activas:**
- Sistema de préstamos básico
- Gestión de estados (PENDING → APPROVED → PICKED_UP → RETURNED)
- Vista de estudiantes con estados correctos
- Panel de administración de préstamos
- Panel de administración de materiales
- Panel de administración de usuarios

⏳ **Funcionalidades Pendientes (requieren migración DB):**
- Asignación de laboratorios a materiales (Lab-Elect / Lab-Ing)
- Asignación de laboratorios a responsables LAB_MANAGER
- Filtrado automático por laboratorio asignado
- Permisos granulares por laboratorio

## 📝 Pasos para Activar el Sistema de Laboratorios

### 1. Ejecutar Migración de Base de Datos

```bash
# Navegar al directorio del proyecto
cd ueslabs

# Ejecutar la migración (requiere DATABASE_URL configurada)
npx prisma db push
```

### 2. Descomentar Campos en getCurrentUser

**Archivo:** `lib/auth-server.ts`

```typescript
// CAMBIAR DE:
// assignedLab: true, // Commented out until DB migration is run

// A:
assignedLab: true,
```

### 3. Hacer assignedLab Obligatorio

**Archivo:** `lib/types.ts`

```typescript
// CAMBIAR DE:
assignedLab?: Lab | null; // Optional until DB migration is run

// A:
assignedLab: Lab | null;
```

### 4. Activar Funcionalidad de Asignación de Laboratorio

**Archivo:** `components/admin/users.ts`

```typescript
// DESCOMENTAR:
export async function updateUserAssignedLab(
  userId: string,
  assignedLab: Lab | null,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { assignedLab: assignedLab },
  });
  revalidatePath("/admin/users");
}

// Y COMENTAR/ELIMINAR el throw Error temporal
```

### 5. Habilitar Selector de Laboratorio en AdminUsers

**Archivo:** `components/admin/admin-users.tsx`

```typescript
// CAMBIAR DE:
disabled={true}

// A:
disabled={false}

// Y actualizar el mensaje de error para ser normal
```

### 6. Remover Verificaciones Temporales

**Archivo:** `app/api/loans/[id]/status/route.ts`

```typescript
// CAMBIAR DE:
if (user.assignedLab !== undefined) {
  // validaciones...
}

// A:
if (!user.assignedLab) {
  return NextResponse.json(
    { error: "No tienes un laboratorio asignado" },
    { status: 403 }
  );
}
// resto de validaciones...
```

## 🔧 Configuración Post-Migración

### 1. Asignar Laboratorios a Usuarios LAB_MANAGER

1. Ir a **Admin → Usuarios**
2. Cambiar rol de usuario a "Responsable de Laboratorio"
3. Seleccionar laboratorio asignado (Lab-Elect o Lab-Ing)

### 2. Asignar Laboratorios a Materiales

1. Ir a **Admin → Materiales**
2. Editar cada material existente
3. Asignar laboratorio correspondiente (Lab-Elect o Lab-Ing)

### 3. Crear Nuevos Materiales

Al crear nuevos materiales, el campo "Laboratorio" será obligatorio.

## 🎯 Funcionalidades del Sistema Completo

### Para ADMIN:
- ✅ Ve todos los materiales y préstamos
- ✅ Puede asignar laboratorios a usuarios LAB_MANAGER
- ✅ Puede crear/editar materiales en cualquier laboratorio
- ✅ Gestiona todos los estados de préstamos

### Para LAB_MANAGER:
- 🔄 Solo ve materiales de su laboratorio asignado
- 🔄 Solo ve préstamos que contengan materiales de su laboratorio
- 🔄 Solo puede cambiar estados de préstamos de su laboratorio
- 🔄 Solo puede crear materiales en su laboratorio asignado

### Para STUDENT:
- ✅ Ve todos los materiales disponibles
- ✅ Puede crear solicitudes de préstamo
- ✅ Ve el estado real de sus préstamos
- ✅ Recibe notificaciones de cambios de estado

## 🔍 Verificación de Funcionamiento

### 1. Verificar Base de Datos
```sql
-- Verificar que los campos existen
DESCRIBE users;
DESCRIBE materials;

-- Verificar enums
SHOW COLUMNS FROM users LIKE 'assignedLab';
SHOW COLUMNS FROM materials LIKE 'lab';
```

### 2. Verificar Asignaciones
```sql
-- Ver usuarios LAB_MANAGER con laboratorios asignados
SELECT name, email, role, assignedLab FROM users WHERE role = 'LAB_MANAGER';

-- Ver materiales por laboratorio
SELECT name, category, lab FROM materials ORDER BY lab;
```

### 3. Pruebas Funcionales

1. **Login como ADMIN**: Debe ver todos los materiales y préstamos
2. **Login como LAB_MANAGER**: Debe ver solo materiales/préstamos de su lab
3. **Crear préstamo mezclando labs**: LAB_MANAGER no debe poder gestionarlo
4. **Cambiar estados**: Solo el LAB_MANAGER del lab correspondiente debe poder

## ⚠️ Notas Importantes

- **Backup**: Siempre respalda la base de datos antes de ejecutar migraciones
- **Desarrollo**: Estas instrucciones son para el entorno de desarrollo
- **Producción**: En producción, usa `npx prisma migrate deploy` en lugar de `db push`
- **Rollback**: Si algo sale mal, puedes revertir los cambios comentando los campos nuevamente

## 🆘 Solución de Problemas

### Error: "assignedLab does not exist"
- Ejecutar `npx prisma generate` después de la migración
- Reiniciar el servidor de desarrollo

### Error: "Lab enum not found"
- Verificar que el enum Lab esté en `prisma/schema.prisma`
- Ejecutar `npx prisma generate`

### LAB_MANAGER ve todos los préstamos
- Verificar que `user.assignedLab` no sea null
- Verificar query en `app/admin/loans/page.tsx`

---

**Una vez completada la configuración, tendrás un sistema completo de gestión por laboratorios con permisos granulares y separación total entre Lab-Elect y Lab-Ing.**