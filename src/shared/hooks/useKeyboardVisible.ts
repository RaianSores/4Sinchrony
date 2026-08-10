import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// No Android com windowSoftInputMode="adjustResize", a janela encolhe quando o
// teclado abre, mas Views sem `flex`/`flexShrink` (como o topSection de telas
// de login/cadastro) mantêm seu tamanho intrínseco e passam a ocupar espaço
// demais para a altura disponível — o conteúdo do bottomSheet acaba
// sobrepondo o topSection. Este hook permite que a tela recolha elementos
// decorativos enquanto o teclado estiver visível, liberando espaço.
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return visible;
}
