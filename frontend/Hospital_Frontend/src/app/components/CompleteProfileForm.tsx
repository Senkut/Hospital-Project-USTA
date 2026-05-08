import React from 'react';
import { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  programa: string;
  institucionEducativa: string;
  tipoVinculacion: 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización';
  foto?: string;
  nombresCompletos: string;
  apellidos: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)';
  fechaNacimiento: string;
  lugarNacimiento: string;
  direccionTunja: string;
  lugarResidenciaPermanente: string;
  celular: string;
  email: string;
  direccionRepresentanteLegal: string;
  ciudadRepresentanteLegal: string;
  nombreRepresentanteLegal: string;
  parentesco: string;
  celularRepresentanteLegal: string;
  idiomaAdicional?: string;
  actividadesComplementarias?: string;
  nombrePadre?: string;
  edadPadre?: string;
  nombreMadre?: string;
  edadMadre?: string;
  tieneHijos: boolean;
  nombreHijos?: string;
  edadesHijos?: string;
  nombreEsposo?: string;
  edadEsposo?: string;
  enfermedadesGenerales?: string;
  enfermedadesMentales?: string;
  medicamentos?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  grupoSanguineo?: string;
  companerosTunja?: string;
  nucleoFamiliarTunja?: string;
  name: string;
  universidad: string;
  semestre?: string;
  genero: 'masculino' | 'femenino';
  induccionHospitalaria: boolean;
  fechaInduccion?: string;
  arl: boolean;
  fechaARL?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  checkInTime?: string;
  checkOutTime?: string;
  password?: string;
}

interface CompleteProfileFormProps {
  student: Student;
  onUpdateStudent: (id: string, data: Partial<Student>) => void;
}

export function CompleteProfileForm({ student, onUpdateStudent }: CompleteProfileFormProps) {
  const [formData, setFormData] = useState({
    // Datos ya existentes
    programa: student.programa,
    institucionEducativa: student.institucionEducativa,
    tipoVinculacion: student.tipoVinculacion,
    nombresCompletos: student.nombresCompletos,
    apellidos: student.apellidos,
    cedula: student.cedula,
    tipoDocumento: student.tipoDocumento || 'C.C.',
    email: student.email,
    celular: student.celular,
    genero: student.genero,

    // Datos a completar
    foto: student.foto || '',
    estadoCivil: student.estadoCivil || 'Soltero(a)' as 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)',
    fechaNacimiento: student.fechaNacimiento || '',
    lugarNacimiento: student.lugarNacimiento || '',
    direccionTunja: student.direccionTunja || '',
    lugarResidenciaPermanente: student.lugarResidenciaPermanente || '',
    direccionRepresentanteLegal: student.direccionRepresentanteLegal || '',
    ciudadRepresentanteLegal: student.ciudadRepresentanteLegal || '',
    nombreRepresentanteLegal: student.nombreRepresentanteLegal || '',
    parentesco: student.parentesco || '',
    celularRepresentanteLegal: student.celularRepresentanteLegal || '',
    idiomaAdicional: student.idiomaAdicional || '',
    actividadesComplementarias: student.actividadesComplementarias || '',
    nombrePadre: student.nombrePadre || '',
    edadPadre: student.edadPadre || '',
    nombreMadre: student.nombreMadre || '',
    edadMadre: student.edadMadre || '',
    tieneHijos: student.tieneHijos || false,
    nombreHijos: student.nombreHijos || '',
    edadesHijos: student.edadesHijos || '',
    nombreEsposo: student.nombreEsposo || '',
    edadEsposo: student.edadEsposo || '',
    enfermedadesGenerales: student.enfermedadesGenerales || '',
    enfermedadesMentales: student.enfermedadesMentales || '',
    medicamentos: student.medicamentos || '',
    alergias: student.alergias || '',
    peso: student.peso || '',
    talla: student.talla || '',
    imc: student.imc || '',
    grupoSanguineo: student.grupoSanguineo || '',
    companerosTunja: student.companerosTunja || '',
    nucleoFamiliarTunja: student.nucleoFamiliarTunja || '',
    semestre: student.semestre || '',
    induccionHospitalaria: student.induccionHospitalaria || false,
    fechaInduccion: student.fechaInduccion || '',
    arl: student.arl || false,
    fechaARL: student.fechaARL || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Actualizar estudiante con toda la información y cambiar estado a ACTIVO
    const updatedData = {
      ...formData,
      estado: 'ACTIVO' as const,
      name: `${formData.nombresCompletos} ${formData.apellidos}`,
      universidad: formData.institucionEducativa
    };

    onUpdateStudent(student.id, updatedData);
    toast.success('¡Perfil completado exitosamente! Tu estado ahora es ACTIVO.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header de Bienvenida */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-200 p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">
              ¡Bienvenido/a {student.nombresCompletos}!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Para activar tu cuenta, por favor completa la siguiente información
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 px-6 py-3 rounded-full">
              <span className="text-2xl">⚠️</span>
              <span className="font-bold text-yellow-800">Estado Actual: PENDIENTE POR COMPLETAR</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-8 space-y-8">
          {/* Información Personal */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">👤 Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex justify-center mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-400">📷</span>
                    )}
                  </div>
                  <label className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Subir Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, foto: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="C.C.">Cédula de Ciudadanía</option>
                  <option value="C.E.">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Civil <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.estadoCivil}
                  onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Unión Libre">Unión Libre</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lugarNacimiento}
                  onChange={(e) => setFormData({ ...formData, lugarNacimiento: e.target.value })}
                  placeholder="Ciudad, Departamento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <input
                  type="text"
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  placeholder="Ej: 7, 8, 9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📞 Información de Residencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de Residencia en Tunja <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccionTunja}
                  onChange={(e) => setFormData({ ...formData, direccionTunja: e.target.value })}
                  placeholder="Calle/Carrera/Diagonal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar de Residencia Permanente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lugarResidenciaPermanente}
                  onChange={(e) => setFormData({ ...formData, lugarResidenciaPermanente: e.target.value })}
                  placeholder="Ciudad de origen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Representante Legal */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">👥 Representante Legal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Representante Legal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombreRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, nombreRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parentesco <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentesco}
                  onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  placeholder="Ej: Padre, Madre, Hermano"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección del Representante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccionRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, direccionRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad del Representante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.ciudadRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, ciudadRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celular del Representante <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.celularRepresentanteLegal}
                  onChange={(e) => setFormData({ ...formData, celularRepresentanteLegal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Otros Datos */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Otros Datos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idioma Adicional</label>
                <input
                  type="text"
                  value={formData.idiomaAdicional}
                  onChange={(e) => setFormData({ ...formData, idiomaAdicional: e.target.value })}
                  placeholder="Inglés, Francés, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actividades Complementarias</label>
                <input
                  type="text"
                  value={formData.actividadesComplementarias}
                  onChange={(e) => setFormData({ ...formData, actividadesComplementarias: e.target.value })}
                  placeholder="Deportes, música, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Aspectos Familiares */}
          <div className="border-l-4 border-pink-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">👨‍👩‍👧‍👦 Aspectos Familiares (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Padre</label>
                <input
                  type="text"
                  value={formData.nombrePadre}
                  onChange={(e) => setFormData({ ...formData, nombrePadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input
                  type="text"
                  value={formData.edadPadre}
                  onChange={(e) => setFormData({ ...formData, edadPadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Madre</label>
                <input
                  type="text"
                  value={formData.nombreMadre}
                  onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input
                  type="text"
                  value={formData.edadMadre}
                  onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Aspectos de Salud */}
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">🏥 Aspectos de Salud (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                <textarea
                  value={formData.alergias}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
                <select
                  value={formData.grupoSanguineo}
                  onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input
                  type="text"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Convivencia */}
          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">🏠 Convivencia en Tunja</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Con quién vives en Tunja?
                </label>
                <input
                  type="text"
                  value={formData.companerosTunja}
                  onChange={(e) => setFormData({ ...formData, companerosTunja: e.target.value })}
                  placeholder="Solo, compañeros, familia, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg font-bold text-lg flex items-center gap-3"
            >
              <Save className="w-6 h-6" />
              Completar Perfil y Activar Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
