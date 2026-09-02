FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY wait-for-it.sh .

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]