/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
    it('should render default message when no props provided', () => {
        render(<EmptyState />);
        expect(screen.getByText('暫無資料')).toBeInTheDocument();
    });

    it('should render custom message and description', () => {
        const customMessage = '沒有找到活動';
        const customDescription = '請嘗試其他的搜尋條件。';

        render(<EmptyState message={customMessage} description={customDescription} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
        expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it('should render action button and trigger onAction on click', () => {
        const handleAction = vi.fn();
        const actionLabel = '返回首頁';

        render(<EmptyState actionLabel={actionLabel} onAction={handleAction} />);

        const button = screen.getByRole('button', { name: actionLabel });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(handleAction).toHaveBeenCalledTimes(1);
    });
});
