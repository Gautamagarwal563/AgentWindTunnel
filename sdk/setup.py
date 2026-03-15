from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="windtunnel-ai",
    version="0.1.0",
    author="Agent Windtunnel",
    description="CI/CD for AI Agents — catch prompt regressions before they ship",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Gautamagarwal563/AgentWindTunnel",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Software Development :: Testing",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.9",
    install_requires=[
        "openai>=1.0.0",
        "supabase>=2.0.0",
        "requests>=2.28.0",
        "python-dotenv>=1.0.0",
        "click>=8.0.0",
    ],
    entry_points={
        "console_scripts": [
            "windtunnel=windtunnel.cli:cli",
        ],
    },
)
