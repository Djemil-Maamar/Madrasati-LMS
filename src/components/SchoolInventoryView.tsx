import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Wrench,
  BookOpen,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Edit,
  Trash2,
  ArrowRight,
  Layers,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Barcode,
  Save,
  X,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Tag,
  RotateCcw,
} from 'lucide-react';
import {
  InventoryItem,
  InventoryCategory,
  MaintenanceStatus,
  AssignmentStatus,
  MaintenanceRecord,
  Language,
  SchoolConfig,
  ClassItem,
  Teacher,
  Student,
} from '../types';

interface SchoolInventoryViewProps {
  inventory: InventoryItem[];
  classes: ClassItem[];
  teachers: Teacher[];
  students: Student[];
  language: Language;
  schoolConfig: SchoolConfig;
  onAddItem: (item: InventoryItem) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem?: (id: string) => void;
}

export const SchoolInventoryView: React.FC<SchoolInventoryViewProps> = ({
  inventory,
  classes,
  teachers,
  students,
  language,
  schoolConfig,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const isArabic = language === 'ar';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedItemForMaintenance, setSelectedItemForMaintenance] = useState<InventoryItem | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItemForAssign, setSelectedItemForAssign] = useState<InventoryItem | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form states for Add/Edit
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    nameAr: '',
    nameFr: '',
    category: 'equipment',
    barcode: '',
    quantity: 1,
    availableQuantity: 1,
    condition: 'good',
    assignmentStatus: 'in_storage',
    assignedToLocation: '',
    assignedToName: '',
    unitValueDZD: 0,
    author: '',
    isbn: '',
    supplier: '',
    notes: '',
  });

  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    condition: 'needs_maintenance' as MaintenanceStatus,
    issueDescription: '',
    technicianName: '',
    cost: 0,
    nextScheduledDate: '',
    actionTaken: '',
  });

  // Assignment form state
  const [assignForm, setAssignForm] = useState({
    assignmentStatus: 'assigned_classroom' as AssignmentStatus,
    targetType: 'classroom', // 'classroom' | 'teacher' | 'student' | 'custom'
    targetId: '',
    assignedLocation: '',
    assignedName: '',
    assignedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
  });

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false;
      }

      // Assignment filter
      if (selectedAssignment !== 'all' && item.assignmentStatus !== selectedAssignment) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          item.nameAr.toLowerCase().includes(q) || item.nameFr.toLowerCase().includes(q);
        const matchBarcode = item.barcode.toLowerCase().includes(q);
        const matchLocation = item.assignedToLocation?.toLowerCase().includes(q);
        const matchAssignee = item.assignedToName?.toLowerCase().includes(q);
        const matchAuthor = item.author?.toLowerCase().includes(q);
        const matchIsbn = item.isbn?.toLowerCase().includes(q);

        return (
          matchName ||
          matchBarcode ||
          matchLocation ||
          matchAssignee ||
          matchAuthor ||
          matchIsbn
        );
      }

      return true;
    });
  }, [inventory, selectedCategory, selectedCondition, selectedAssignment, searchQuery]);

  // Overall Statistics
  const totalUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = inventory.reduce(
    (sum, i) => sum + (i.unitValueDZD || 0) * i.quantity,
    0
  );
  const maintenanceCount = inventory.filter(
    (i) => i.condition === 'needs_maintenance' || i.condition === 'under_repair'
  ).length;
  const inStorageCount = inventory.filter((i) => i.assignmentStatus === 'in_storage').length;
  const inUseCount = inventory.filter((i) => i.assignmentStatus !== 'in_storage').length;
  const libraryBooksCount = inventory
    .filter((i) => i.category === 'library_book')
    .reduce((sum, i) => sum + i.quantity, 0);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `inv-${Date.now()}`,
      nameAr: '',
      nameFr: '',
      category: 'equipment',
      barcode: `INV-${Date.now().toString().slice(-6)}`,
      quantity: 1,
      availableQuantity: 1,
      condition: 'good',
      assignmentStatus: 'in_storage',
      assignedToLocation: 'المخزن المركزي',
      assignedToName: '',
      unitValueDZD: 15000,
      author: '',
      isbn: '',
      supplier: '',
      notes: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddEditModalOpen(true);
  };

  // Submit Add / Edit
  const handleSaveAddEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr?.trim()) return;

    if (editingItem) {
      const updated: InventoryItem = {
        ...editingItem,
        ...(formData as InventoryItem),
      };
      onUpdateItem(updated);
    } else {
      const newItem: InventoryItem = {
        id: formData.id || `inv-${Date.now()}`,
        nameAr: formData.nameAr || '',
        nameFr: formData.nameFr || formData.nameAr || '',
        category: (formData.category as InventoryCategory) || 'equipment',
        barcode: formData.barcode || `INV-${Date.now().toString().slice(-6)}`,
        quantity: Number(formData.quantity) || 1,
        availableQuantity: Number(formData.availableQuantity ?? formData.quantity) || 1,
        condition: (formData.condition as MaintenanceStatus) || 'good',
        assignmentStatus: (formData.assignmentStatus as AssignmentStatus) || 'in_storage',
        assignedToLocation: formData.assignedToLocation || 'المخزن المركزي',
        assignedToName: formData.assignedToName || '',
        unitValueDZD: Number(formData.unitValueDZD) || 0,
        author: formData.author,
        isbn: formData.isbn,
        supplier: formData.supplier,
        notes: formData.notes,
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      };
      onAddItem(newItem);
    }

    setIsAddEditModalOpen(false);
  };

  // Open Maintenance modal
  const handleOpenMaintenance = (item: InventoryItem) => {
    setSelectedItemForMaintenance(item);
    setMaintenanceForm({
      condition: item.condition,
      issueDescription: item.maintenanceNotes || '',
      technicianName: '',
      cost: 0,
      nextScheduledDate: item.nextScheduledMaintenance || '',
      actionTaken: '',
    });
    setIsMaintenanceModalOpen(true);
  };

  // Save Maintenance record
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMaintenance) return;

    const newRecord: MaintenanceRecord = {
      id: `mnt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      issueDescription: maintenanceForm.issueDescription || 'فحص وصيانة دورية',
      actionTaken: maintenanceForm.actionTaken || 'مراجعة الحالة التقنية',
      technicianName: maintenanceForm.technicianName || 'فني الصيانة المعتمد',
      cost: Number(maintenanceForm.cost) || 0,
      status: maintenanceForm.condition === 'good' ? 'completed' : 'in_progress',
    };

    const updatedHistory = [newRecord, ...(selectedItemForMaintenance.maintenanceHistory || [])];

    const updatedItem: InventoryItem = {
      ...selectedItemForMaintenance,
      condition: maintenanceForm.condition,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextScheduledMaintenance: maintenanceForm.nextScheduledDate || selectedItemForMaintenance.nextScheduledMaintenance,
      maintenanceNotes: maintenanceForm.issueDescription,
      maintenanceHistory: updatedHistory,
    };

    onUpdateItem(updatedItem);
    setIsMaintenanceModalOpen(false);
  };

  // Open Assign modal
  const handleOpenAssign = (item: InventoryItem) => {
    setSelectedItemForAssign(item);
    setAssignForm({
      assignmentStatus: item.assignmentStatus === 'in_storage' ? 'assigned_classroom' : item.assignmentStatus,
      targetType: 'classroom',
      targetId: classes[0]?.id || '',
      assignedLocation: classes[0]?.name || 'قاعة 1',
      assignedName: '',
      assignedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
    });
    setIsAssignModalOpen(true);
  };

  // Save Assignment
  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAssign) return;

    let finalLocation = assignForm.assignedLocation;
    let finalName = assignForm.assignedName;

    if (assignForm.targetType === 'classroom') {
      const cls = classes.find((c) => c.id === assignForm.targetId);
      if (cls) finalLocation = cls.name;
    } else if (assignForm.targetType === 'teacher') {
      const tch = teachers.find((t) => t.id === assignForm.targetId);
      if (tch) finalName = tch.name;
    } else if (assignForm.targetType === 'student') {
      const std = students.find((s) => s.id === assignForm.targetId);
      if (std) finalName = `${std.fullName} (${std.regNumber})`;
    }

    const updatedItem: InventoryItem = {
      ...selectedItemForAssign,
      assignmentStatus: assignForm.assignmentStatus,
      assignedToLocation: finalLocation || 'قاعة دراسية',
      assignedToName: finalName,
      assignedDate: assignForm.assignedDate,
      expectedReturnDate: assignForm.expectedReturnDate,
      availableQuantity:
        assignForm.assignmentStatus === 'in_storage'
          ? selectedItemForAssign.quantity
          : Math.max(0, selectedItemForAssign.availableQuantity - 1),
    };

    onUpdateItem(updatedItem);
    setIsAssignModalOpen(false);
  };

  // Direct Return to storage
  const handleReturnToStorage = (item: InventoryItem) => {
    const updatedItem: InventoryItem = {
      ...item,
      assignmentStatus: 'in_storage',
      assignedToLocation: 'المخزن المركزي',
      assignedToName: '',
      availableQuantity: item.quantity,
      expectedReturnDate: undefined,
    };
    onUpdateItem(updatedItem);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isArabic ? 'سجل جرد التجهيزات والوسائل والمكتبة' : 'Inventaire & Gestion des Actifs'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                {inventory.length} {isArabic ? 'مقتنى' : 'articles'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isArabic
                ? 'إدارة شاملة لأجهزة العرض، حواسيب الإعلام الآلي، كتب المكتبة، عتاد المخابر وتجهيزات القاعات مع تتبع دوري للصيانة والتخصيص'
                : 'Gestion complète du matériel pédagogique, mobilier et suivi des prêts & maintenances'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print Report */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>{isArabic ? 'طباعة محضر الجرد' : 'Imprimer PV d’inventaire'}</span>
          </button>

          {/* Add New Item */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة عتاد / كتاب جديد' : 'Nouvel Article'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Assets & Value */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isArabic ? 'إجمالي المقتنيات المسجلة' : 'Total des actifs'}
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalUnits} <span className="text-xs font-normal text-slate-500">{isArabic ? 'وحدة' : 'unités'}</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              {totalValue.toLocaleString('fr-FR')} {isArabic ? 'د.ج' : 'DZD'}
            </div>
          </div>
        </div>

        {/* In Use / Assigned */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isArabic ? 'مخصصة بالقاعات والأساتذة' : 'En exploitation'}
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {inUseCount} <span className="text-xs font-normal text-slate-500">{isArabic ? 'وسيلة' : 'actifs'}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {inStorageCount} {isArabic ? 'في المخزن المركزي' : 'en stock'}
            </div>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className={`p-3 rounded-xl ${
            maintenanceCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
          }`}>
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isArabic ? 'تنبيهات الصيانة والإصلاح' : 'Maintenance'}
            </div>
            <div className={`text-xl font-black mt-0.5 ${
              maintenanceCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {maintenanceCount} <span className="text-xs font-normal">{isArabic ? 'حالة' : 'alertes'}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {maintenanceCount > 0 ? (isArabic ? 'بحاجة لصيانة عاجلة' : 'Action requise') : (isArabic ? 'العتاد سليم' : 'Opérationnel')}
            </div>
          </div>
        </div>

        {/* Library Holdings */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isArabic ? 'كتب ومراجع المكتبة' : 'Fonds Bibliothèque'}
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {libraryBooksCount} <span className="text-xs font-normal text-slate-500">{isArabic ? 'كتاب' : 'titres'}</span>
            </div>
            <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              {isArabic ? 'متاحة للبحث والمطالعة' : 'Prêts scolaires'}
            </div>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isArabic ? 'البحث في المخزون' : 'Recherche'}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={isArabic ? 'بحث بالاسم، الباركود، الموقع...' : 'Nom, code-barres, lieu...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ps-9 pe-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isArabic ? 'التصنيف / النوع' : 'Catégorie'}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{isArabic ? 'جميع الأصناف' : 'Toutes les catégories'}</option>
            <option value="equipment">{isArabic ? 'أجهزة ومعدات (Projectors, Datashow)' : 'Équipements & Vidéo'}</option>
            <option value="library_book">{isArabic ? 'كتب ومراجع المكتبة المدرسية' : 'Livres de bibliothèque'}</option>
            <option value="classroom_asset">{isArabic ? 'أثاث وتجهيزات القاعات' : 'Mobilier de classe'}</option>
            <option value="it_devices">{isArabic ? 'إعلام آلي وحواسيب وطابعات' : 'Informatique & Réseau'}</option>
            <option value="lab_gear">{isArabic ? 'مخابر العلوم والتجارب الفيزيائية' : 'Laboratoire de sciences'}</option>
            <option value="sports">{isArabic ? 'عتاد التربية البدنية والرياضية' : 'Équipement sportif'}</option>
          </select>
        </div>

        {/* Condition / Maintenance Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isArabic ? 'الحالة التقنية والصيانة' : 'État de maintenance'}
          </label>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{isArabic ? 'جميع الحالات التقنية' : 'Tous les états'}</option>
            <option value="good">{isArabic ? 'سليم ويعمل بكفاءة (Bon état)' : 'Bon état'}</option>
            <option value="needs_maintenance">{isArabic ? 'يحتاج إلى صيانة (À réviser)' : 'Maintenance requise'}</option>
            <option value="under_repair">{isArabic ? 'قيد الإصلاح (En réparation)' : 'En réparation'}</option>
            <option value="damaged">{isArabic ? 'تالف / خارج الخدمة' : 'Hors d’usage'}</option>
          </select>
        </div>

        {/* Assignment Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isArabic ? 'حالة التخصيص والإعارة' : 'Statut d’affectation'}
          </label>
          <select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{isArabic ? 'الكل (مخزن ومخصص)' : 'Toutes les affectations'}</option>
            <option value="in_storage">{isArabic ? 'في المخزن المركزي (En stock)' : 'En stock'}</option>
            <option value="assigned_classroom">{isArabic ? 'مخصص لقاعة دراسية' : 'En salle de classe'}</option>
            <option value="assigned_teacher">{isArabic ? 'عهدة أستاذ' : 'Affecté à un enseignant'}</option>
            <option value="borrowed_student">{isArabic ? 'معار لتلميذ' : 'Emprunté par élève'}</option>
          </select>
        </div>

      </div>

      {/* Main Inventory Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        
        <div className="p-4 bg-slate-50/70 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isArabic ? 'قائمة الجرد والتجهيزات المسجلة' : 'Registre des Actifs & Équipements'}
            </h3>
            <span className="text-xs text-slate-400">({filteredInventory.length})</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isArabic ? 'تحديث فوري للسجل' : 'Registre à jour'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100/75 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                <th className="p-3 text-start w-14">#</th>
                <th className="p-3 text-start min-w-[220px]">
                  {isArabic ? 'اسم المقتنى / الكتاب / الوسيلة' : 'Désignation de l’actif'}
                </th>
                <th className="p-3 text-start w-32">{isArabic ? 'التصنيف' : 'Catégorie'}</th>
                <th className="p-3 text-center w-24">{isArabic ? 'الكمية' : 'Quantité'}</th>
                <th className="p-3 text-start w-44">{isArabic ? 'حالة التخصيص والموقع' : 'Affectation & Lieu'}</th>
                <th className="p-3 text-center w-32">{isArabic ? 'الحالة التقنية والصيانة' : 'État / Maintenance'}</th>
                <th className="p-3 text-center w-28">{isArabic ? 'القيمة (د.ج)' : 'Valeur DZD'}</th>
                <th className="p-3 text-center w-36">{isArabic ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div>{isArabic ? 'لا توجد عناصر مطابقة لخيارات البحث المحددة.' : 'Aucun article trouvé.'}</div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, idx) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition"
                    >
                      {/* Index */}
                      <td className="p-3 text-slate-400 font-semibold">{idx + 1}</td>

                      {/* Name & Barcode */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {isArabic ? item.nameAr : item.nameFr}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>{item.barcode}</span>
                          {item.isbn && (
                            <>
                              <span>•</span>
                              <span>ISBN: {item.isbn}</span>
                            </>
                          )}
                          {item.author && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600 dark:text-purple-400">{item.author}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.category === 'equipment' && <Monitor className="w-3 h-3 text-blue-600" />}
                          {item.category === 'library_book' && <BookOpen className="w-3 h-3 text-purple-600" />}
                          {item.category === 'classroom_asset' && <Package className="w-3 h-3 text-amber-600" />}
                          {item.category === 'it_devices' && <Monitor className="w-3 h-3 text-indigo-600" />}
                          {item.category === 'lab_gear' && <Sparkles className="w-3 h-3 text-emerald-600" />}
                          {item.category === 'sports' && <Layers className="w-3 h-3 text-rose-600" />}
                          <span>
                            {item.category === 'equipment'
                              ? isArabic ? 'أجهزة وعرض' : 'Équipement'
                              : item.category === 'library_book'
                              ? isArabic ? 'كتاب ومطالعة' : 'Livre'
                              : item.category === 'classroom_asset'
                              ? isArabic ? 'أثاث القاعات' : 'Mobilier'
                              : item.category === 'it_devices'
                              ? isArabic ? 'إعلام آلي' : 'Informatique'
                              : item.category === 'lab_gear'
                              ? isArabic ? 'مخبر علوم' : 'Labo'
                              : isArabic ? 'رياضة' : 'Sport'}
                          </span>
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="p-3 text-center">
                        <span className="font-black text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        {item.availableQuantity < item.quantity && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            {item.availableQuantity} {isArabic ? 'متاح' : 'dispo'}
                          </div>
                        )}
                      </td>

                      {/* Assignment & Location */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.assignedToLocation || (isArabic ? 'المخزن' : 'Stock')}</span>
                        </div>
                        {item.assignedToName ? (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.assignedToName}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.assignmentStatus === 'in_storage'
                              ? isArabic ? 'جاهز للإعارة' : 'Disponible'
                              : isArabic ? 'مخصص' : 'Affecté'}
                          </div>
                        )}
                      </td>

                      {/* Condition / Maintenance Badge */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenMaintenance(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border cursor-pointer transition ${
                            item.condition === 'good'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : item.condition === 'needs_maintenance'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 animate-pulse'
                              : item.condition === 'under_repair'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          }`}
                          title={isArabic ? 'انقر لتسجيل صيانة أو فحص دوري' : 'Cliquer pour mettre à jour la maintenance'}
                        >
                          <Wrench className="w-3 h-3" />
                          <span>
                            {item.condition === 'good'
                              ? isArabic ? 'سليم' : 'Bon'
                              : item.condition === 'needs_maintenance'
                              ? isArabic ? 'يحتاج صيانة' : 'À réviser'
                              : item.condition === 'under_repair'
                              ? isArabic ? 'قيد الإصلاح' : 'En répar.'
                              : isArabic ? 'تالف' : 'Défectueux'}
                          </span>
                        </button>
                      </td>

                      {/* Value DZD */}
                      <td className="p-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {item.unitValueDZD ? item.unitValueDZD.toLocaleString('fr-FR') : '--'}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Assign / Return button */}
                          {item.assignmentStatus === 'in_storage' ? (
                            <button
                              onClick={() => handleOpenAssign(item)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 cursor-pointer transition"
                              title={isArabic ? 'تسجيل إعارة أو تخصيص' : 'Affecter'}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReturnToStorage(item)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                              title={isArabic ? 'استرجاع للمخزن المركزي' : 'Retour au stock'}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Item button */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 cursor-pointer transition"
                            title={isArabic ? 'تعديل البيانات' : 'Modifier'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Maintenance Log button */}
                          <button
                            onClick={() => handleOpenMaintenance(item)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                            title={isArabic ? 'سجل الصيانة' : 'Journal de maintenance'}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================== */}
      {/* ADD / EDIT ITEM MODAL                                      */}
      {/* ========================================================== */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {editingItem
                      ? isArabic ? 'تعديل بيانات المقتنى / الكتاب' : 'Modifier l’actif'
                      : isArabic ? 'إضافة عتاد أو كتاب جديد للمخزون' : 'Nouvel actif / livre'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'تسجيل تفاصيل التجهيز، الباركود والموقع' : 'Enregistrer les détails de l’actif'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAddEdit} className="p-5 overflow-y-auto space-y-4 text-xs font-bold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Name Ar */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'اسم المقتنى / عنوان الكتاب (بالعربية) *' : 'Désignation (Arabe) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={isArabic ? 'مثال: جهاز عرض فيديو Datashow أو رواية الأدب العربي' : 'Nom de l’équipement'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Name Fr */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'التسمية الرسمية (بالفرنسية أو الاسم التقني)' : 'Désignation (Français)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    placeholder="Vidéoprojecteur interactif / Roman"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'التصنيف' : 'Catégorie'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="equipment">{isArabic ? 'أجهزة وعرض (Datashow)' : 'Équipement'}</option>
                    <option value="library_book">{isArabic ? 'كتب ومراجع المكتبة' : 'Livre bibliothèque'}</option>
                    <option value="classroom_asset">{isArabic ? 'أثاث وتجهيزات القاعات' : 'Mobilier'}</option>
                    <option value="it_devices">{isArabic ? 'إعلام آلي وشبكات' : 'Informatique'}</option>
                    <option value="lab_gear">{isArabic ? 'مخبر العلوم والفيزياء' : 'Laboratoire'}</option>
                    <option value="sports">{isArabic ? 'عتاد رياضي' : 'Sport'}</option>
                  </select>
                </div>

                {/* Barcode / Serial */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'رمز الباركود / الرقم التسلسلي' : 'Code-barres / N° Série'}
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'الكمية الإجمالية' : 'Quantité totale'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Estimated Unit Value in DZD */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'القيمة التقديرية للوحدة (د.ج)' : 'Valeur estimée (DZD)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.unitValueDZD}
                    onChange={(e) => setFormData({ ...formData, unitValueDZD: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Specific for Library Book: Author & ISBN */}
                {formData.category === 'library_book' && (
                  <>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">
                        {isArabic ? 'المؤلف / الكاتب' : 'Auteur'}
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="اسم الكاتب"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">
                        {isArabic ? 'الرقم الدولي المعياري (ISBN)' : 'Code ISBN'}
                      </label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        placeholder="978-xxx-xxx"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Maintenance Condition */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'الحالة التقنية والصيانة' : 'État technique'}
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as MaintenanceStatus })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="good">{isArabic ? 'سليم ويعمل بكفاءة' : 'Bon état'}</option>
                    <option value="needs_maintenance">{isArabic ? 'يحتاج إلى صيانة' : 'Maintenance requise'}</option>
                    <option value="under_repair">{isArabic ? 'قيد الإصلاح' : 'En réparation'}</option>
                    <option value="damaged">{isArabic ? 'تالف / خارج الخدمة' : 'Hors d’usage'}</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'الموقع / القاعة الحالية' : 'Lieu actuel'}
                  </label>
                  <input
                    type="text"
                    value={formData.assignedToLocation}
                    onChange={(e) => setFormData({ ...formData, assignedToLocation: e.target.value })}
                    placeholder={isArabic ? 'مثال: المخزن المركزي، قاعة 101، مخبر العلوم' : 'Salle 101'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Supplier */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'المورد أو مصدر الاقتناء' : 'Fournisseur'}
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder={isArabic ? 'مؤسسة التجهيزات المدرسية أو دار النشر' : 'Nom du fournisseur'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'ملاحظات وتفاصيل إضافية' : 'Observations'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isArabic ? 'حفظ المقتنى' : 'Enregistrer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MAINTENANCE LOG & UPDATE MODAL                             */}
      {/* ========================================================== */}
      {isMaintenanceModalOpen && selectedItemForMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {isArabic ? 'تسجيل صيانة ومتابعة الحالة التقنية' : 'Suivi de Maintenance'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isArabic ? selectedItemForMaintenance.nameAr : selectedItemForMaintenance.nameFr}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="p-5 overflow-y-auto space-y-4 text-xs font-bold">
              
              {/* Current condition */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'الحالة التقنية الجديدة' : 'Nouvel état'}
                </label>
                <select
                  value={maintenanceForm.condition}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, condition: e.target.value as MaintenanceStatus })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                >
                  <option value="good">{isArabic ? 'سليم ويعمل بكفاءة (تمت الصيانة بنجاح)' : 'Bon état (Réparé)'}</option>
                  <option value="needs_maintenance">{isArabic ? 'يحتاج إلى صيانة وتدخل تقني' : 'Maintenance requise'}</option>
                  <option value="under_repair">{isArabic ? 'قيد الإصلاح بورشة الصيانة' : 'En cours de réparation'}</option>
                  <option value="damaged">{isArabic ? 'تالف نهائياً / غير قابل للإصلاح' : 'Hors d’usage'}</option>
                </select>
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'وصف العطل أو متطلبات الفحص الدوري *' : 'Description de la panne / révision *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={maintenanceForm.issueDescription}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issueDescription: e.target.value })}
                  placeholder={isArabic ? 'مثال: تنظيف مرشح جهاز العرض، تغيير مسحوق الحبر، فحص التوصيلات الكهربائية' : 'Description des travaux'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                />
              </div>

              {/* Action taken */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'الإجراء التقني المتخذ / قطع الغيار' : 'Action entreprise / Pièces'}
                </label>
                <input
                  type="text"
                  value={maintenanceForm.actionTaken}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, actionTaken: e.target.value })}
                  placeholder={isArabic ? 'تم استبدال الكابل وضبط العدسات' : 'Action réalisée'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Technician & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'اسم التقني أو ورشة الصيانة' : 'Technicien / Prestataire'}
                  </label>
                  <input
                    type="text"
                    value={maintenanceForm.technicianName}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technicianName: e.target.value })}
                    placeholder={isArabic ? 'م. كريم حداد' : 'Nom du technicien'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'تكلفة الصيانة (د.ج)' : 'Coût d’intervention (DZD)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Next Scheduled Maintenance */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'موعد الصيانة الدورية القادم' : 'Prochaine révision'}
                </label>
                <input
                  type="date"
                  value={maintenanceForm.nextScheduledDate}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, nextScheduledDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Previous History list if available */}
              {selectedItemForMaintenance.maintenanceHistory && selectedItemForMaintenance.maintenanceHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {isArabic ? 'سجل العمليات السابقة:' : 'Historique récent:'}
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedItemForMaintenance.maintenanceHistory.map((rec) => (
                      <div key={rec.id} className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div className="flex justify-between items-center text-slate-500">
                          <span>{rec.date} - {rec.technicianName}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{rec.cost} د.ج</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{rec.issueDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isArabic ? 'تحديث حالة الصيانة' : 'Enregistrer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ASSIGN / CHECKOUT MODAL                                    */}
      {/* ========================================================== */}
      {isAssignModalOpen && selectedItemForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {isArabic ? 'تسجيل إعارة أو تخصيص ميداني' : 'Affectation & Emprunt'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isArabic ? selectedItemForAssign.nameAr : selectedItemForAssign.nameFr}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssign} className="p-5 space-y-4 text-xs font-bold">
              
              {/* Destination Type */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'نوع جهة التخصيص' : 'Type d’affectation'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, targetType: 'classroom', assignmentStatus: 'assigned_classroom' })}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                      assignForm.targetType === 'classroom'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isArabic ? 'قاعة دراسية' : 'Salle'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, targetType: 'teacher', assignmentStatus: 'assigned_teacher' })}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                      assignForm.targetType === 'teacher'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isArabic ? 'عهدة أستاذ' : 'Enseignant'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, targetType: 'student', assignmentStatus: 'borrowed_student' })}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                      assignForm.targetType === 'student'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isArabic ? 'إعارة لتلميذ' : 'Élève'}
                  </button>
                </div>
              </div>

              {/* Target Entity Selector */}
              {assignForm.targetType === 'classroom' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'اختر القسم / القاعة' : 'Sélectionner la classe'}
                  </label>
                  <select
                    value={assignForm.targetId}
                    onChange={(e) => setAssignForm({ ...assignForm, targetId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignForm.targetType === 'teacher' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'اختر الأستاذ المستلم للعهدة' : 'Sélectionner l’enseignant'}
                  </label>
                  <select
                    value={assignForm.targetId}
                    onChange={(e) => setAssignForm({ ...assignForm, targetId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignForm.targetType === 'student' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'اختر التلميذ المستعير' : 'Sélectionner l’élève'}
                  </label>
                  <select
                    value={assignForm.targetId}
                    onChange={(e) => setAssignForm({ ...assignForm, targetId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.regNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Assignment Date & Expected Return */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'تاريخ التسليم / الإعارة' : 'Date d’affectation'}
                  </label>
                  <input
                    type="date"
                    value={assignForm.assignedDate}
                    onChange={(e) => setAssignForm({ ...assignForm, assignedDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'التاريخ المتوقع للإرجاع' : 'Date de retour prévue'}
                  </label>
                  <input
                    type="date"
                    value={assignForm.expectedReturnDate}
                    onChange={(e) => setAssignForm({ ...assignForm, expectedReturnDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isArabic ? 'تأكيد التخصيص' : 'Confirmer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* OFFICIAL PRINTABLE INVENTORY REPORT MODAL                   */}
      {/* ========================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Controls */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-600" />
                <span>{isArabic ? 'محضر جرد التجهيزات والوسائل التعليمية والمكتبة' : 'Procès-Verbal d’Inventaire Officiel'}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isArabic ? 'طباعة المستند' : 'Imprimer'}</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
              
              {/* Official Algerian School Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
                <h4 className="text-xs font-bold text-slate-600">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                <h4 className="text-xs font-bold text-slate-600">وزارة التربية الوطنية</h4>
                <h3 className="text-lg font-black text-slate-900">{schoolConfig.nameAr}</h3>
                <div className="text-xs font-semibold text-slate-500">
                  {schoolConfig.address} • السنة الدراسية: {schoolConfig.academicYear}
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                  محضر جرد الوسائل التعليمية والتجهيزات المدرسية
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  تاريخ استخراج الوثيقة: {new Date().toLocaleDateString(isArabic ? 'ar-DZ' : 'fr-FR')}
                </div>
              </div>

              {/* Metrics Summary Table */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="text-slate-500 block">إجمالي التجهيزات</span>
                  <span className="text-base font-black text-slate-900">{totalUnits} وحدة</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="text-slate-500 block">قيد الاستغلال والتخصيص</span>
                  <span className="text-base font-black text-slate-900">{inUseCount} مقتنى</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="text-slate-500 block">في المخزن المركزي</span>
                  <span className="text-base font-black text-slate-900">{inStorageCount} مقتنى</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="text-slate-500 block">القيمة الإجمالية التقديرية</span>
                  <span className="text-base font-black text-slate-900">{totalValue.toLocaleString('fr-FR')} د.ج</span>
                </div>
              </div>

              {/* Items Inventory Table */}
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 border-e border-slate-300 text-center w-10">#</th>
                    <th className="p-2 border-e border-slate-300 text-start">تسمية المقتنى / الكتاب</th>
                    <th className="p-2 border-e border-slate-300 text-center w-28">الباركود</th>
                    <th className="p-2 border-e border-slate-300 text-center w-16">الكمية</th>
                    <th className="p-2 border-e border-slate-300 text-start w-36">الموقع / الحائز</th>
                    <th className="p-2 border-e border-slate-300 text-center w-24">الحالة</th>
                    <th className="p-2 text-center w-28">القيمة (د.ج)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inventory.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="p-2 border-e border-slate-200 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-e border-slate-200 font-bold">{item.nameAr}</td>
                      <td className="p-2 border-e border-slate-200 text-center font-mono">{item.barcode}</td>
                      <td className="p-2 border-e border-slate-200 text-center font-black">{item.quantity}</td>
                      <td className="p-2 border-e border-slate-200">{item.assignedToLocation} {item.assignedToName ? `(${item.assignedToName})` : ''}</td>
                      <td className="p-2 border-e border-slate-200 text-center font-bold">
                        {item.condition === 'good' ? 'سليم' : item.condition === 'needs_maintenance' ? 'صيانة' : 'إصلاح'}
                      </td>
                      <td className="p-2 text-center">{item.unitValueDZD?.toLocaleString('fr-FR') || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures Footer */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs font-bold text-slate-800">
                <div>
                  <p>المقتصد / مسؤول المخزن</p>
                  <div className="h-16"></div>
                  <p className="text-[11px] text-slate-400">التوقيع والختم</p>
                </div>
                <div>
                  <p>الناظر / المشرف العام</p>
                  <div className="h-16"></div>
                  <p className="text-[11px] text-slate-400">التوقيع والختم</p>
                </div>
                <div>
                  <p>مدير المؤسسة</p>
                  <div className="h-16"></div>
                  <p className="text-[11px] text-slate-400">د. عمار جميل</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
