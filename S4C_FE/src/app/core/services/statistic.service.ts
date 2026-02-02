import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatisticResponse, StatisticPeriod } from '../models/statistic.models';

@Injectable({
    providedIn: 'root'
})
export class StatisticService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/Statistics`;

    getStatistics(
        period: StatisticPeriod = 'week',
        examType?: string,
        skill?: string
    ): Observable<StatisticResponse> {
        let params = new HttpParams().set('Period', period);

        if (examType) {
            params = params.set('ExamType', examType);
        }

        if (skill) {
            params = params.set('Skill', skill);
        }

        return this.http.get<StatisticResponse>(this.apiUrl, { params });
    }
}
