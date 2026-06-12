from setuptools import setup, find_packages

setup(
    name="bitlance-ai-sdk",
    version="1.0.0",
    description="Official Python SDK for the Bitlance SEO/GEO Content Generation API",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Bitlance Automation",
    url="https://github.com/bitlance/bitlance-ai-python",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
)
