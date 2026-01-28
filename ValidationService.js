// ===========================================
// SERVIÇO DE VALIDAÇÃO DE DADOS
// ===========================================

const ValidationService = {
  
  // Schemas de validação
  schemas: {
    transaction: {
      date: { required: true, type: 'date' },
      type: { required: true, enum: ['Entrada', 'Saída'] },
      category: { required: true, type: 'string', minLength: 1 },
      subcategory: { required: false, type: 'string' },
      value: { required: true, type: 'number', min: 0 },
      accountId: { required: true, type: 'string', minLength: 1 },
      status: { required: true, type: 'string' },
      description: { required: true, type: 'string', minLength: 1 },
      costCenter: { required: false, type: 'string' }
    },
    
    account: {
      id: { required: true, type: 'string', minLength: 1 },
      name: { required: true, type: 'string', minLength: 1 },
      type: { required: true, type: 'string' },
      balance: { required: false, type: 'number' },
      icon: { required: false, type: 'string' },
      budget: { required: false, type: 'number' }
    },
    
    goal: {
      categoria: { required: true, type: 'string', minLength: 1 },
      meta: { required: true, type: 'number', min: 0 },
      corAlerta: { required: false, type: 'string' },
      tipo: { required: true, enum: ['Gasto', 'Objetivo'] }
    }
  },
  
  // Valida um objeto contra um schema
  validate: function(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      return { valid: false, errors: ['Schema não encontrado: ' + schemaName] };
    }
    
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // Verifica campo obrigatório
      if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push(`Campo obrigatório ausente: ${field}`);
        continue;
      }
      
      // Se não é obrigatório e está vazio, skip validações
      if (!rules.required && (value === null || value === undefined || value === '')) {
        continue;
      }
      
      // Valida tipo
      if (rules.type) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} deve ser string, recebido: ${typeof value}`);
        }
        else if (rules.type === 'number' && typeof value !== 'number') {
          errors.push(`${field} deve ser número, recebido: ${typeof value}`);
        }
        else if (rules.type === 'date') {
          // Valida formato de data (YYYY-MM-DD ou Date object)
          if (!(value instanceof Date) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push(`${field} deve estar no formato YYYY-MM-DD ou ser Date object`);
          }
        }
      }
      
      // Valida enumeração
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} deve ser um dos valores: ${rules.enum.join(', ')}. Recebido: ${value}`);
      }
      
      // Valida tamanho mínimo (strings)
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} deve ter no mínimo ${rules.minLength} caracteres`);
      }
      
      // Valida valor mínimo (números)
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`${field} deve ser >= ${rules.min}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  // Sanitiza dados removendo campos inválidos
  sanitize: function(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) return data;
    
    const sanitized = {};
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // Se campo obrigatório está ausente, use valor padrão
      if (rules.required && (value === null || value === undefined || value === '')) {
        if (rules.type === 'string') sanitized[field] = '';
        else if (rules.type === 'number') sanitized[field] = 0;
        else sanitized[field] = null;
      } else {
        sanitized[field] = value;
      }
    }
    
    return sanitized;
  },
  
  // Valida batch de dados
  validateBatch: function(dataArray, schemaName) {
    const results = {
      valid: [],
      invalid: []
    };
    
    dataArray.forEach((item, index) => {
      const validation = this.validate(item, schemaName);
      
      if (validation.valid) {
        results.valid.push(item);
      } else {
        results.invalid.push({
          index: index,
          data: item,
          errors: validation.errors
        });
      }
    });
    
    return results;
  }
};

// Exporta para uso no DataService
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationService;
}