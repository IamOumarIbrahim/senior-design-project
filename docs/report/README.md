# Senior Design Project LaTeX Report (`docs/report`)

Contains the complete LaTeX project proposal, chapters, figures, bibtex bibliographies, and acronym definitions for the Driver Monitoring System project.

## Structure

- `Proposal/`: The structured LaTeX proposal root containing `Proposal.tex`, `Chapters/`, `Figures/`, `Bibliography/`, and `acronyms/`.
- `Proposal.pdf`: Generated compiled proposal PDF (19 pages).
- `Overleaf Projects (1 items) (27)/`: Mirror archive matching Overleaf online collaboration sync.

## Compilation

Compile using `pdflatex` and `bibtex` from the `Proposal/` directory:

```bash
cd docs/report/Proposal
pdflatex -interaction=nonstopmode Proposal.tex
bibtex Proposal
pdflatex -interaction=nonstopmode Proposal.tex
pdflatex -interaction=nonstopmode Proposal.tex
```
