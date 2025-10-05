import React from 'react';
import { Info, TrendingUp, Users } from 'lucide-react';
import { professionalGroups, comparePensionWithGroup } from '../data/professionalGroups';

interface ProfessionalContextProps {
  selectedGroupId?: string;
  onGroupSelect: (groupId: string | undefined) => void;
  userPension?: number;
  className?: string;
}

export const ProfessionalContext: React.FC<ProfessionalContextProps> = ({
  selectedGroupId,
  onGroupSelect,
  userPension,
  className = ''
}) => {
  const selectedGroup = selectedGroupId 
    ? professionalGroups.find(g => g.id === selectedGroupId)
    : undefined;



  return (
    <div className={`w-full bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kontekst Zawodowy
        </h3>
        <p className="text-sm text-gray-600">
          Porównaj swoją prognozowaną emeryturę z przeciętną dla różnych grup zawodowych
        </p>
      </div>
      <div className="space-y-4">
        {/* Wybór grupy zawodowej */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Grupa zawodowa (opcjonalnie)
          </label>
          <select 
            value={selectedGroupId || ''} 
            onChange={(e) => onGroupSelect(e.target.value || undefined)}
            disabled={!onGroupSelect || onGroupSelect.toString().includes('() => {}')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${
              !onGroupSelect || onGroupSelect.toString().includes('() => {}')
                ? 'border-zus-gray-200 bg-zus-gray-100 text-zus-gray-500 cursor-not-allowed'
                : 'border-gray-300 focus:ring-2 focus:ring-zus-green-primary focus:border-transparent'
            }`}
          >
            <option value="">Wybierz grupę zawodową...</option>
            {professionalGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} (Kody: {group.codeRange})
              </option>
            ))}
          </select>
        </div>

        {selectedGroup && (
          <div className="space-y-4">
            {/* Informacje o grupie */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informacje o grupie
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedGroup.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Przeciętna emerytura (2024)
                  </span>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedGroup.averagePension.toLocaleString('pl-PL')} zł
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    Przeciętna podstawa składki (2024)
                  </span>
                  <p className="text-lg font-semibold text-blue-600">
                    {selectedGroup.averageContributionBase.toLocaleString('pl-PL')} zł
                  </p>
                </div>
              </div>
            </div>

            {/* Porównanie z prognozą użytkownika */}
            {userPension && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Porównanie z Twoją prognozą
                </h4>
                {(() => {
                  const comparison = comparePensionWithGroup(userPension, selectedGroup);
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Twoja prognoza:</span>
                        <span className="font-semibold text-blue-600">
                          {userPension.toLocaleString('pl-PL')} zł
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Przeciętna grupy:</span>
                        <span className="font-semibold text-green-600">
                          {selectedGroup.averagePension.toLocaleString('pl-PL')} zł
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Różnica:</span>
                          <span className={`font-bold ${comparison.isHigher ? 'text-green-600' : 'text-red-600'}`}>
                            {comparison.isHigher ? '+' : ''}{comparison.difference.toLocaleString('pl-PL')} zł
                            <span className="text-xs ml-1">
                              ({comparison.percentageDifference > 0 ? '+' : ''}{comparison.percentageDifference.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {comparison.isHigher 
                            ? `Twoja prognoza jest wyższa o ${comparison.percentageDifference.toFixed(1)}%`
                            : `Twoja prognoza jest niższa o ${Math.abs(comparison.percentageDifference).toFixed(1)}%`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Informacja gdy nie wybrano grupy */}
        {!selectedGroup && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Dlaczego warto wybrać grupę zawodową?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Porównanie z przeciętnymi emeryturami w Twojej branży</li>
                  <li>• Kontekst dla Twojej prognozy emerytalnej</li>
                  <li>• Dane oparte na statystykach ZUS z 2024 roku</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};