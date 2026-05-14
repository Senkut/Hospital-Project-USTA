import React from 'react';
import { useState } from 'react';
import { UserPlus, Download, Search, Edit2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { QuickStudentRegister } from './QuickStudentRegister';

interface Student {
  id: string;
  // Información Académica
  programa: string;
  institucionEducativa: string;
  tipoVinculacion: 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización';

  // Información Personal
  foto?: string;
  nombresCompletos: string;
  apellidosCompletos: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)';
  fechaNacimiento: string;
  lugarNacimiento: string;

  // Información de Contacto
  direccionTunja: string;
  lugarResidenciaPermanente: string;
  celular: string;
  email: string;

  // Representante Legal
  direccionRepresentanteLegal: string;
  ciudadRepresentanteLegal: string;
  nombreRepresentanteLegal: string;
  parentesco: string;
  celularRepresentanteLegal: string;

  // Otros Datos
  idiomaAdicional?: string;
  actividadesComplementarias?: string;

  // Aspectos Familiares
  nombrePadre?: string;
  edadPadre?: string;
  nombreMadre?: string;
  edadMadre?: string;
  tieneHijos: boolean;
  nombreHijos?: string;
  edadesHijos?: string;
  nombreEsposo?: string;
  edadEsposo?: string;

  // Aspectos de Salud
  enfermedadesGenerales?: string;
  enfermedadesMentales?: string;
  medicamentos?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  grupoSanguineo?: string;

  // Convivencia
  companerosTunja?: string;
  nucleoFamiliarTunja?: string;

  // Campos antiguos (compatibilidad)
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

interface StudentRegistryProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'estado'>) => void;
  onUpdateStudent: (id: string, student: Partial<Student>) => void;
}

export function StudentRegistry({ students, onAddStudent, onUpdateStudent }: StudentRegistryProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Información Académica
    programa: '',
    institucionEducativa: '',
    tipoVinculacion: 'Estudiante en práctica' as 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización',

    // Información Personal
    foto: '',
    nombresCompletos: '',
    apellidosCompletos: '',
    cedula: '',
    tipoDocumento: 'C.C.' as 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro',
    estadoCivil: 'Soltero(a)' as 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)',
    fechaNacimiento: '',
    lugarNacimiento: '',

    // Información de Contacto
    direccionTunja: '',
    lugarResidenciaPermanente: '',
    celular: '',
    email: '',

    // Representante Legal
    direccionRepresentanteLegal: '',
    ciudadRepresentanteLegal: '',
    nombreRepresentanteLegal: '',
    parentesco: '',
    celularRepresentanteLegal: '',

    // Otros Datos
    idiomaAdicional: '',
    actividadesComplementarias: '',

    // Aspectos Familiares
    nombrePadre: '',
    edadPadre: '',
    nombreMadre: '',
    edadMadre: '',
    tieneHijos: false,
    nombreHijos: '',
    edadesHijos: '',
    nombreEsposo: '',
    edadEsposo: '',

    // Aspectos de Salud
    enfermedadesGenerales: '',
    enfermedadesMentales: '',
    medicamentos: '',
    alergias: '',
    peso: '',
    talla: '',
    imc: '',
    grupoSanguineo: '',

    // Convivencia
    companerosTunja: '',
    nucleoFamiliarTunja: '',

    // Campos antiguos
    genero: 'masculino' as 'masculino' | 'femenino',
    semestre: '',
    induccionHospitalaria: false,
    fechaInduccion: '',
    arl: false,
    fechaARL: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const studentData: any = {
      ...formData,
      apellidosCompletos: formData.apellidosCompletos,           // renombrar
      direccionRepresentante: formData.direccionRepresentanteLegal,   // renombrar
      ciudadRepresentante: formData.ciudadRepresentanteLegal,         // renombrar
      nombreRepresentante: formData.nombreRepresentanteLegal,         // renombrar
      celularRepresentante: formData.celularRepresentanteLegal,       // renombrar
      name: `${formData.nombresCompletos} ${formData.apellidosCompletos}`,
      universidad: formData.institucionEducativa
    };

    if (editingId) {
      // Al editar, solo actualizar contraseña si se ingresó una nueva
      if (formData.password) {
        studentData.password = formData.password;
      }
      onUpdateStudent(editingId, studentData);
      setEditingId(null);
      toast.success('Estudiante actualizado correctamente');
    } else {
      // Al crear nuevo, usar contraseña ingresada o "est2026" como predeterminada
      studentData.password = formData.password || 'est2026';
      onAddStudent(studentData);
    }

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      programa: '',
      institucionEducativa: '',
      tipoVinculacion: 'Estudiante en práctica',
      foto: '',
      nombresCompletos: '',
      apellidosCompletos: '',
      cedula: '',
      tipoDocumento: 'C.C.',
      estadoCivil: 'Soltero(a)',
      fechaNacimiento: '',
      lugarNacimiento: '',
      direccionTunja: '',
      lugarResidenciaPermanente: '',
      celular: '',
      email: '',
      direccionRepresentanteLegal: '',
      ciudadRepresentanteLegal: '',
      nombreRepresentanteLegal: '',
      parentesco: '',
      celularRepresentanteLegal: '',
      idiomaAdicional: '',
      actividadesComplementarias: '',
      nombrePadre: '',
      edadPadre: '',
      nombreMadre: '',
      edadMadre: '',
      tieneHijos: false,
      nombreHijos: '',
      edadesHijos: '',
      nombreEsposo: '',
      edadEsposo: '',
      enfermedadesGenerales: '',
      enfermedadesMentales: '',
      medicamentos: '',
      alergias: '',
      peso: '',
      talla: '',
      imc: '',
      grupoSanguineo: '',
      companerosTunja: '',
      nucleoFamiliarTunja: '',
      genero: 'masculino',
      semestre: '',
      induccionHospitalaria: false,
      fechaInduccion: '',
      arl: false,
      fechaARL: '',
      password: ''
    });
  };

  const handleEdit = (student: Student) => {
    setFormData({
      programa: student.programa,
      institucionEducativa: student.institucionEducativa,
      tipoVinculacion: student.tipoVinculacion,
      foto: student.foto || '',
      nombresCompletos: student.nombresCompletos,
      apellidosCompletos: student.apellidosCompletos,
      cedula: student.cedula,
      tipoDocumento: student.tipoDocumento,
      estadoCivil: student.estadoCivil,
      fechaNacimiento: student.fechaNacimiento,
      lugarNacimiento: student.lugarNacimiento,
      direccionTunja: student.direccionTunja,
      lugarResidenciaPermanente: student.lugarResidenciaPermanente,
      celular: student.celular,
      email: student.email,
      direccionRepresentanteLegal: student.direccionRepresentanteLegal,
      ciudadRepresentanteLegal: student.ciudadRepresentanteLegal,
      nombreRepresentanteLegal: student.nombreRepresentanteLegal,
      parentesco: student.parentesco,
      celularRepresentanteLegal: student.celularRepresentanteLegal,
      idiomaAdicional: student.idiomaAdicional || '',
      actividadesComplementarias: student.actividadesComplementarias || '',
      nombrePadre: student.nombrePadre || '',
      edadPadre: student.edadPadre || '',
      nombreMadre: student.nombreMadre || '',
      edadMadre: student.edadMadre || '',
      tieneHijos: student.tieneHijos,
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
      genero: student.genero,
      semestre: student.semestre || '',
      induccionHospitalaria: student.induccionHospitalaria,
      fechaInduccion: student.fechaInduccion || '',
      arl: student.arl,
      fechaARL: student.fechaARL || '',
      password: student.password || ''
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setShowForm(false);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cedula.includes(searchTerm) ||
    student.universidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.programa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Registro de Estudiantes</h2>
          <p className="text-sm text-gray-600">Gestión de información académica y personal</p>
        </div>
        <div className="flex gap-3">
          <QuickStudentRegister onAddStudent={onAddStudent} />
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-md font-semibold"
          >
            <UserPlus className="w-5 h-5" />
            Registro Completo
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            {editingId ? 'Editar Estudiante' : 'Registro Completo de Estudiante'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Académica */}
            <div className="border-l-4 border-cyan-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📚 Información Académica</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programa Académico *</label>
                  <select
                    required
                    value={formData.programa}
                    onChange={(e) => setFormData({ ...formData, programa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Seleccione un programa</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Enfermería">Enfermería</option>
                    <option value="Fisioterapia">Fisioterapia</option>
                    <option value="Nutrición y Dietética">Nutrición y Dietética</option>
                    <option value="Terapia Respiratoria">Terapia Respiratoria</option>
                    <option value="Bacteriología">Bacteriología</option>
                    <option value="Instrumentación Quirúrgica">Instrumentación Quirúrgica</option>
                    <option value="Psicología">Psicología</option>
                    <option value="Trabajo Social">Trabajo Social</option>
                    <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                    <option value="Fonoaudiología">Fonoaudiología</option>
                    <option value="Odontología">Odontología</option>
                    <option value="Optometría">Optometría</option>
                    <option value="Radiología e Imágenes Diagnósticas">Radiología e Imágenes Diagnósticas</option>
                  </select>
                </div>

                <div className="row-span-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-400">📷</span>
                    )}
                  </div>
                  <label className="cursor-pointer text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institución Educativa en Convenio *</label>
                  <select
                    required
                    value={formData.institucionEducativa}
                    onChange={(e) => setFormData({ ...formData, institucionEducativa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Seleccione una universidad</option>
                    <option value="Universidad Santo Tomás">Universidad Santo Tomás</option>
                    <option value="Universidad Pedagógica y Tecnológica de Colombia">Universidad Pedagógica y Tecnológica de Colombia</option>
                    <option value="Universidad de Boyacá">Universidad de Boyacá</option>
                    <option value="Fundación Universitaria Juan de Castellanos">Fundación Universitaria Juan de Castellanos</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vinculación Académica *</label>
                  <div className="space-y-2">
                    {(['Estudiante en práctica', 'Médico Interno', 'Residente del programa de especialización'] as const).map((tipo) => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipoVinculacion"
                          value={tipo}
                          checked={formData.tipoVinculacion === tipo}
                          onChange={(e) => setFormData({ ...formData, tipoVinculacion: e.target.value as any })}
                          className="w-4 h-4 text-cyan-600"
                        />
                        <span className="text-sm text-gray-700">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">👤 Información Personal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres Completos *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombresCompletos}
                    onChange={(e) => setFormData({ ...formData, nombresCompletos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidosCompletos}
                    onChange={(e) => setFormData({ ...formData, apellidosCompletos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
                  <select
                    required
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="C.C.">Cédula de Ciudadanía</option>
                    <option value="C.E.">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="NIT">NIT</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Identificación *</label>
                  <input
                    type="text"
                    required
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value.replace(/[^0-9]/g, '') })}
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
                  <select
                    required
                    value={formData.estadoCivil}
                    onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Unión Libre">Unión Libre</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de Nacimiento *</label>
                  <input
                    type="text"
                    required
                    value={formData.lugarNacimiento}
                    onChange={(e) => setFormData({ ...formData, lugarNacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
                  <select
                    required
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'masculino' | 'femenino' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📞 Información de Contacto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Residencia en Tunja *</label>
                  <input
                    type="text"
                    required
                    value={formData.direccionTunja}
                    onChange={(e) => setFormData({ ...formData, direccionTunja: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de Residencia Permanente *</label>
                  <input
                    type="text"
                    required
                    value={formData.lugarResidenciaPermanente}
                    onChange={(e) => setFormData({ ...formData, lugarResidenciaPermanente: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular *</label>
                  <input
                    type="tel"
                    required
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Representante Legal */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">👥 Representante Legal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de la Residencia Representante Legal *</label>
                  <input
                    type="text"
                    required
                    value={formData.direccionRepresentanteLegal}
                    onChange={(e) => setFormData({ ...formData, direccionRepresentanteLegal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad de la Residencia Representante Legal *</label>
                  <input
                    type="text"
                    required
                    value={formData.ciudadRepresentanteLegal}
                    onChange={(e) => setFormData({ ...formData, ciudadRepresentanteLegal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de un Familiar/Representante Legal *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombreRepresentanteLegal}
                    onChange={(e) => setFormData({ ...formData, nombreRepresentanteLegal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco *</label>
                  <input
                    type="text"
                    required
                    value={formData.parentesco}
                    onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                    placeholder="Ej: Padre, Madre, Hermano"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular del Representante Legal *</label>
                  <input
                    type="tel"
                    required
                    value={formData.celularRepresentanteLegal}
                    onChange={(e) => setFormData({ ...formData, celularRepresentanteLegal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Otros Datos */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Otros Datos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma Además del Español</label>
                  <input
                    type="text"
                    value={formData.idiomaAdicional}
                    onChange={(e) => setFormData({ ...formData, idiomaAdicional: e.target.value })}
                    placeholder="Escrito, Leído, Conversado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actividades Complementarias</label>
                  <input
                    type="text"
                    value={formData.actividadesComplementarias}
                    onChange={(e) => setFormData({ ...formData, actividadesComplementarias: e.target.value })}
                    placeholder="Música, danza, teatro, deporte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                  <input
                    type="text"
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Aspectos Familiares */}
            <div className="border-l-4 border-pink-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">👨‍👩‍👧‍👦 Aspectos Familiares</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Padre</label>
                  <input
                    type="text"
                    value={formData.nombrePadre}
                    onChange={(e) => setFormData({ ...formData, nombrePadre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <input
                    type="text"
                    value={formData.edadPadre}
                    onChange={(e) => setFormData({ ...formData, edadPadre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Madre</label>
                  <input
                    type="text"
                    value={formData.nombreMadre}
                    onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <input
                    type="text"
                    value={formData.edadMadre}
                    onChange={(e) => setFormData({ ...formData, edadMadre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tieneHijos}
                      onChange={(e) => setFormData({ ...formData, tieneHijos: e.target.checked })}
                      className="w-4 h-4 text-cyan-600"
                    />
                    <span className="text-sm font-medium text-gray-700">¿Tiene Hijos?</span>
                  </label>
                </div>

                {formData.tieneHijos && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de los Hijos</label>
                      <input
                        type="text"
                        value={formData.nombreHijos}
                        onChange={(e) => setFormData({ ...formData, nombreHijos: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Edades</label>
                      <input
                        type="text"
                        value={formData.edadesHijos}
                        onChange={(e) => setFormData({ ...formData, edadesHijos: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </>
                )}

                {(formData.estadoCivil === 'Casado(a)' || formData.estadoCivil === 'Unión Libre') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Esposo(a) - Nombre <span className="text-gray-400 text-xs">(opcional)</span></label>
                      <input
                        type="text"
                        value={formData.nombreEsposo}
                        onChange={(e) => setFormData({ ...formData, nombreEsposo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Edad <span className="text-gray-400 text-xs">(opcional)</span></label>
                      <input
                        type="text"
                        value={formData.edadEsposo}
                        onChange={(e) => setFormData({ ...formData, edadEsposo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Aspectos de Salud */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">🏥 Aspectos de Salud</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades Generales</label>
                  <textarea
                    value={formData.enfermedadesGenerales}
                    onChange={(e) => setFormData({ ...formData, enfermedadesGenerales: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades Mentales</label>
                  <textarea
                    value={formData.enfermedadesMentales}
                    onChange={(e) => setFormData({ ...formData, enfermedadesMentales: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos</label>
                  <textarea
                    value={formData.medicamentos}
                    onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                  <textarea
                    value={formData.alergias}
                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input
                    type="text"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Talla (cm)</label>
                  <input
                    type="text"
                    value={formData.talla}
                    onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IMC</label>
                  <input
                    type="text"
                    value={formData.imc}
                    onChange={(e) => setFormData({ ...formData, imc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
                  <select
                    value={formData.grupoSanguineo}
                    onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              </div>
            </div>

            {/* Convivencia */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">🏠 Convivencia</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compañeros con los que vive en Tunja</label>
                  <input
                    type="text"
                    value={formData.companerosTunja}
                    onChange={(e) => setFormData({ ...formData, companerosTunja: e.target.value })}
                    placeholder="Si vive solo escriba N/A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Núcleo Familiar en Tunja o con quienes convive en Tunja</label>
                  <textarea
                    value={formData.nucleoFamiliarTunja}
                    onChange={(e) => setFormData({ ...formData, nucleoFamiliarTunja: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Inducción y ARL */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">✅ Requisitos Hospitalarios y Acceso</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inducción Hospitalaria</label>
                      <p className="text-xs text-gray-500">¿Ha completado la inducción?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.induccionHospitalaria}
                        onChange={(e) => setFormData({ ...formData, induccionHospitalaria: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                  {formData.induccionHospitalaria && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inducción</label>
                      <input
                        type="date"
                        required={formData.induccionHospitalaria}
                        value={formData.fechaInduccion}
                        onChange={(e) => setFormData({ ...formData, fechaInduccion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ARL vigente</label>
                      <p className="text-xs text-gray-500">¿Tiene ARL vigente?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.arl}
                        onChange={(e) => setFormData({ ...formData, arl: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                  {formData.arl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vigencia ARL</label>
                      <input
                        type="date"
                        required={formData.arl}
                        value={formData.fechaARL}
                        onChange={(e) => setFormData({ ...formData, fechaARL: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de Acceso</label>
                    <p className="text-xs text-gray-500 mb-3">
                      {editingId
                        ? 'Dejar en blanco para mantener la contraseña actual'
                        : 'Si no se especifica, se usará "est2026" como predeterminada'}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingId ? '••••••••' : 'est2026'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <p className="text-xs text-purple-600 mt-2">
                    🔑 El estudiante usará esta contraseña para acceder al portal
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-md font-semibold"
              >
                {editingId ? '✓ Actualizar Estudiante' : '✓ Guardar Estudiante'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Estudiantes Registrados</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-cyan-50 to-teal-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ESTUDIANTE</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">DOCUMENTO</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">PROGRAMA</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">VINCULACIÓN</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ESTADO</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-gray-100 hover:bg-cyan-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {student.foto ? (
                        <img src={student.foto} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg ${student.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}>
                          {student.genero === 'masculino' ? '👨' : '👩'}
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{student.name}</span>
                        <div className="text-xs text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{student.cedula}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-800">{student.programa}</div>
                    <div className="text-xs text-gray-500">{student.universidad}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium">
                      {student.tipoVinculacion}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={student.estado}
                      onChange={(e) => onUpdateStudent(student.id, { estado: e.target.value as any })}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${student.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                          student.estado === 'INACTIVO' ? 'bg-gray-100 text-gray-700' :
                            student.estado === 'RETIRADO' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="RETIRADO">RETIRADO</option>
                      <option value="PENDIENTE">PENDIENTE</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors"
                        title="Editar estudiante"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const newPw = student.cedula;
                          onUpdateStudent(student.id, { password: newPw });
                          toast.success(`🔑 Contraseña de ${student.name.split(' ')[0]} restablecida a su número de cédula`);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Restablecer contraseña a cédula"
                      >
                        🔑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron estudiantes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600 font-medium">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </div>
      </div>
    </div>
  );
}
