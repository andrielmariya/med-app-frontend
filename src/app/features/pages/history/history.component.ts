import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HealthService } from '../../../core/services/health.service';
import { LucideAngularModule, Activity, LayoutDashboard, History, BarChart3, Settings, LogOut, FileText, ChevronDown, ChevronRight, Search, Bell, Users, Key, Lock } from 'lucide-angular';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { finalize } from 'rxjs';
import { HealthRecord } from '../../../core/models/health.model';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule, SidebarComponent, HeaderComponent],
    templateUrl: './history.html'
})
export class HistoryComponent implements OnInit {
    records: HealthRecord[] = [];
    loading = true;
    username = '';
    isSuperuser = false;
    expandedRecord: number | null = null;

    readonly ActivityIcon = Activity;
    readonly HistoryIcon = History;
    readonly StatsIcon = BarChart3;
    readonly LogOutIcon = LogOut;
    readonly FileTextIcon = FileText;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronRightIcon = ChevronRight;

    constructor(
        private healthService: HealthService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.username = this.authService.getUsername() || '';
        this.isSuperuser = this.authService.isSuperUser();
        console.log('History init for user:', this.username);

        // Subscribe to records
        this.healthService.records$.subscribe((records: HealthRecord[]) => {
            console.log('History records updated:', records);
            this.records = records;
            this.cdr.detectChanges();
        });

        this.fetchData();
    }

    fetchData() {
        this.loading = true;
        console.log('Fetching history records...');
        this.healthService.fetchDashboardRecords()
            .pipe(finalize(() => {
                this.loading = false;
                console.log('History fetch completed. Records count:', this.records.length);
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: () => console.log('History records fetched successfully'),
                error: (err: any) => {
                    console.error('Error fetching history:', err);
                    if (err.status === 401) {
                        this.handleLogout();
                    }
                }
            });
    }

    toggleExpand(id: number) {
        this.expandedRecord = this.expandedRecord === id ? null : id;
    }

    trackById(index: number, item: HealthRecord) {
        return item.id;
    }

    handleLogout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
