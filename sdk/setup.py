from setuptools import setup, find_packages

setup(
    name='windtunnel',
    version='0.1.0',
    description='CI/CD for AI agents - replay production interactions through LLM versions',
    packages=find_packages(),
    install_requires=[
        'openai>=1.0.0',
        'supabase>=2.0.0',
        'requests>=2.28.0',
        'python-dotenv>=1.0.0',
    ],
    python_requires='>=3.9',
)
