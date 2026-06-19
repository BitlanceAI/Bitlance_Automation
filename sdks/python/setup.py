from setuptools import setup, find_packages

setup(
    name="bitlance-ai-sdk",
    version="1.1.0",
    description="Official Python SDK for the Bitlance SEO/GEO AI Content Generation API",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Bitlance Automation",
    author_email="support@bitlancetechhub.com",
    url="https://github.com/BitlanceAI/bitlance-ai-python",
    project_urls={
        "Homepage": "https://app.bitlance.ai",
        "Documentation": "https://app.bitlance.ai/docs",
    },
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
    ],
    python_requires=">=3.7",
    keywords="seo geo ai content blog automation bitlance",
)
