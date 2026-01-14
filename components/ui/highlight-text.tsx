import React from 'react';

interface HighlightTextProps {
    text: string;
    highlight: string;
    className?: string;
}

export function HighlightText({ text, highlight, className }: HighlightTextProps) {
    if (!highlight.trim()) {
        return <span className={className}>{text}</span>;
    }

    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normText = normalize(text);
    const normHighlight = normalize(highlight);

    if (!normText.includes(normHighlight)) {
        return <span className={`${className || ''} text-muted-foreground`}>{text}</span>;
    }

    const result = [];
    let currentIndex = 0;
    let searchIndex = normText.indexOf(normHighlight);

    while (searchIndex !== -1) {
        // Text before match
        if (searchIndex > currentIndex) {
            result.push(
                <span key={`pre-${currentIndex}`} className="text-muted-foreground">
                    {text.slice(currentIndex, searchIndex)}
                </span>
            );
        }

        // Matched text (using original string content but indices from normalized search)
        const matchEnd = searchIndex + normHighlight.length;
        result.push(
            <span key={`match-${searchIndex}`} className="text-[#00665C]">
                {text.slice(searchIndex, matchEnd)}
            </span>
        );

        currentIndex = matchEnd;
        searchIndex = normText.indexOf(normHighlight, currentIndex);
    }

    // Remaining text
    if (currentIndex < text.length) {
        result.push(
            <span key={`post-${currentIndex}`} className="text-muted-foreground">
                {text.slice(currentIndex)}
            </span>
        );
    }

    return <span className={className}>{result}</span>;
}
