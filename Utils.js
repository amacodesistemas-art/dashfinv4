// ===========================================
// 6. UTILITÁRIOS
// ===========================================

function formatDate(date) {
  try {
    if (date instanceof Date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    }
    
    if (typeof date === 'string' && date.includes('/')) {
      const parts = date.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return String(date);
  } catch (error) {
    return String(date);
  }
}