const isNonEmptyText = (value, maxLength) =>
    typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

exports.validatePatient = ({ nombre, apellido, fecha_nacimiento, telefono, direccion }) => {
    if (!isNonEmptyText(nombre, 100)) return 'El nombre es obligatorio y no puede superar 100 caracteres';
    if (!isNonEmptyText(apellido, 100)) return 'El apellido es obligatorio y no puede superar 100 caracteres';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento || '')) return 'La fecha de nacimiento no es válida';
    const birthDate = new Date(`${fecha_nacimiento}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(birthDate.getTime()) || birthDate >= today) return 'La fecha de nacimiento debe ser anterior a hoy';
    if (!/^\d{8}$/.test(telefono || '')) return 'El teléfono debe contener exactamente 8 dígitos';
    if (!isNonEmptyText(direccion, 255)) return 'La dirección es obligatoria y no puede superar 255 caracteres';
    return null;
};

exports.validateDoctor = ({ nombre, apellido, telefono }) => {
    if (!isNonEmptyText(nombre, 100)) return 'El nombre es obligatorio y no puede superar 100 caracteres';
    if (!isNonEmptyText(apellido, 100)) return 'El apellido es obligatorio y no puede superar 100 caracteres';
    if (!/^\d{8}$/.test(telefono || '')) return 'El teléfono debe contener exactamente 8 dígitos';
    return null;
};

exports.validatePrescription = (medicamentos = []) => {
    if (!Array.isArray(medicamentos)) return 'Los medicamentos de la receta deben enviarse como una lista';
    const ids = new Set();
    for (const medicamento of medicamentos) {
        if (!isPositiveInteger(medicamento.id_medicamento)) return 'Cada medicamento de la receta debe ser válido';
        if (!isNonEmptyText(medicamento.dosis, 100)) return 'Cada dosis es obligatoria y no puede superar 100 caracteres';
        if (ids.has(String(medicamento.id_medicamento))) return 'No puedes repetir un medicamento en la misma receta';
        ids.add(String(medicamento.id_medicamento));
    }
    return null;
};

exports.isNonEmptyText = isNonEmptyText;
exports.isPositiveInteger = isPositiveInteger;
