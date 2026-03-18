package com.example.CraftYourStyle2.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Configuracion de Firebase Admin SDK
 *
 * Inicializa Firebase al arrancar la aplicacion usando
 * el archivo serviceAccountKey.json descargado desde Firebase Console.
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;

    @Value("${firebase.credentials.path}")
    private String firebaseCredentialsPath;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (!firebaseEnabled) {
                System.out.println("Firebase deshabilitado por configuracion. Se omite la inicializacion.");
                return;
            }

            if (firebaseCredentialsPath == null || firebaseCredentialsPath.isBlank()) {
                System.out.println("Ruta de credenciales de Firebase vacia. Se omite la inicializacion.");
                return;
            }

            Path credentialsPath = Path.of(firebaseCredentialsPath);
            if (!Files.exists(credentialsPath)) {
                System.out.println("No se encontro el archivo de credenciales de Firebase en " + credentialsPath + ". Se omite la inicializacion.");
                return;
            }

            if (FirebaseApp.getApps().isEmpty()) {
                FileInputStream serviceAccount = new FileInputStream(credentialsPath.toFile());

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase inicializado correctamente");
            }
        } catch (IOException e) {
            System.err.println("Error al inicializar Firebase: " + e.getMessage());
            System.err.println("Se continuara sin Firebase.");
        }
    }
}
