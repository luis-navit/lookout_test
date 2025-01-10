const handleVerifyEmail = (rule: any, email: string, callback: any): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    callback(new Error('Informe um email válido.'))
  }

  callback()
}

const handleVerifyPassword = (rule: any, password: string, callback: any): void => {
  if (password.length < 8) {
    callback(new Error('A senha deve ter pelo menos 8 caracteres.'))
  }

  const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/
  if (!specialCharacters.test(password)) {
    callback(new Error('A senha deve conter pelo menos um caractere especial.'))
  }

  callback()
}

const handleVerifyConfirmPassword = (
  confirmPassword: string,
  rule: any,
  password: string,
  callback: any
): void => {
  if (confirmPassword !== password) callback(new Error('As senhas devem ser iguais'))

  callback()
}

export { handleVerifyPassword, handleVerifyConfirmPassword, handleVerifyEmail }
