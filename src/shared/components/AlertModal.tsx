import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });

export const useAppAlert = () => useContext(AlertContext);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ title: '' });

  const showAlert = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  const handlePress = (button: AlertButton) => {
    setVisible(false);
    button.onPress?.();
  };

  const buttons = config.buttons || [{ text: 'OK' }];

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.dialog}>
            <Text style={styles.title}>{config.title}</Text>

            {config.message && (
              <Text style={styles.message}>{config.message}</Text>
            )}

            <View style={styles.buttonRow}>
              {buttons.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      index < buttons.length - 1 && styles.buttonBorder,
                    ]}
                    onPress={() => handlePress(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isDestructive && styles.buttonTextDestructive,
                        isCancel && styles.buttonTextCancel,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dialog: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
    width: '82%',
    maxWidth: 340,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonBorder: {
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  buttonTextDestructive: {
    color: theme.colors.danger,
  },
  buttonTextCancel: {
    color: theme.colors.textSecondary,
  },
});
