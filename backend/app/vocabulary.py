"""Curated skill vocabulary, bucketed by category for keyword matching and the radar chart.

Each entry is the canonical display form. Matching against text is case-insensitive
and word-boundary aware (see matching.py), so canonical casing here is just for display.
"""

VOCABULARY: dict[str, list[str]] = {
    "Frontend": [
        "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "TypeScript",
        "JavaScript", "HTML", "CSS", "Sass", "Tailwind CSS", "Redux", "Zustand",
        "Webpack", "Vite", "Framer Motion", "Storybook", "Web Accessibility",
        "Responsive Design", "GraphQL Client", "Figma", "UI/UX",
        "Progressive Web Apps", "WebSockets", "Web Components",
    ],
    "Backend/API": [
        "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot",
        "REST API", "GraphQL", "gRPC", "Microservices", "PostgreSQL", "MySQL",
        "MongoDB", "Redis", "SQL", "NoSQL", "Java", "Python", "Go", "Ruby",
        "Rails", "PHP", "Laravel", ".NET", "C#", "API Design", "OAuth",
        "Message Queues", "Kafka", "RabbitMQ",
    ],
    "DevOps/Cloud": [
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform",
        "Jenkins", "GitHub Actions", "GitLab CI", "Linux", "Nginx", "Ansible",
        "Helm", "Cloud Architecture", "Serverless", "Lambda", "S3",
        "Monitoring", "Prometheus", "Grafana", "Site Reliability", "IaC",
        "Load Balancing", "Networking",
    ],
    "AI/Data": [
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
        "scikit-learn", "Pandas", "NumPy", "Data Analysis", "Data Engineering",
        "ETL", "Spark", "Airflow", "SQL Analytics", "NLP", "LLM",
        "Prompt Engineering", "Computer Vision", "Data Visualization",
        "Statistics", "A/B Testing", "Feature Engineering", "MLOps",
        "Data Pipelines", "Jupyter", "R",
    ],
    "Testing": [
        "Unit Testing", "Integration Testing", "End-to-End Testing", "Jest",
        "Pytest", "Cypress", "Playwright", "Selenium", "Test-Driven Development",
        "QA", "Test Automation", "Mocking", "Load Testing", "Regression Testing",
        "JUnit", "Mocha",
    ],
}

CATEGORIES = list(VOCABULARY.keys())
