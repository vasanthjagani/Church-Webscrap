"""
OWL Parser for Salesian Simple Taxonomy
Parses the OWL file and extracts ontology structure for categorization
"""

import xml.etree.ElementTree as ET

class OntologyParser:
    def __init__(self, owl_file_path):
        self.owl_file_path = owl_file_path
        self.document_types = {}
        self.work_types = {}
        self.themes = {}
        self.areas_of_reference = {}
        self.geo_areas = {}
        self.salesian_family_groups = {}
        self.keyword_mappings = {}
        self._parse_owl()
        self._build_keyword_mappings()
    
    def _parse_owl(self):
        """Parse the OWL file and extract all entities"""
        try:
            tree = ET.parse(self.owl_file_path)
            root = tree.getroot()
            
            # Define namespaces
            namespaces = {
                'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
                'owl': 'http://www.w3.org/2002/07/owl#'
            }
            
            # Find all descriptions
            for desc in root.findall('.//rdf:Description', namespaces):
                about = desc.get('{http://www.w3.org/1999/02/22-rdf-syntax-ns#}about', '')
                if not about:
                    continue
                
                # Extract local name (part after #)
                local_name = about.split('#')[-1] if '#' in about else about
                
                # Get label
                label_elem = desc.find('rdfs:label', namespaces)
                label = label_elem.text if label_elem is not None else local_name
                
                # Get type
                type_elem = desc.find('rdf:type', namespaces)
                if type_elem is not None:
                    type_resource = type_elem.get('{http://www.w3.org/1999/02/22-rdf-syntax-ns#}resource', '')
                    
                    # Categorize based on type
                    if 'DocumentType' in type_resource:
                        self.document_types[local_name] = label
                    elif 'WorkType' in type_resource:
                        self.work_types[local_name] = label
                    elif 'Theme' in type_resource:
                        self.themes[local_name] = label
                    elif 'AreaOfReference' in type_resource:
                        self.areas_of_reference[local_name] = label
                    elif 'GeoArea' in type_resource:
                        self.geo_areas[local_name] = label
                    elif 'SalesianFamilyGroup' in type_resource:
                        self.salesian_family_groups[local_name] = label
        
        except Exception as e:
            print(f"[ERROR] Failed to parse OWL file: {e}")
            raise
    
    def _build_keyword_mappings(self):
        """Build keyword mappings for each category type"""
        # Document Types - map keywords to document types
        doc_type_keywords = {
            'Doc_Image': ['image', 'photo', 'picture', 'gallery', 'img'],
            'Doc_Video': ['video', 'youtube', 'vimeo', 'multimedia'],
            'Doc_Audio': ['audio', 'podcast', 'sound', 'music'],
            'Doc_Manual': ['manual', 'guide', 'handbook', 'instruction'],
            'Doc_Statistics': ['statistics', 'stats', 'data', 'numbers', 'figures'],
            'Doc_InformativeText': ['information', 'info', 'about', 'description'],
            'Doc_Study': ['study', 'research', 'analysis', 'report'],
            'Doc_Speech': ['speech', 'address', 'talk', 'presentation'],
            'Doc_Letter_RectorMajor': ['rector major', 'letter', 'message'],
            'Doc_Letter_MotherGeneral': ['mother general', 'letter', 'message'],
            'Doc_GoodPractice': ['good practice', 'best practice', 'example'],
            'Doc_ScientificArticle': ['scientific', 'article', 'paper', 'publication'],
            'Doc_ScientificMonograph': ['monograph', 'scientific', 'research'],
            'Doc_Constitutions': ['constitution', 'rules', 'regulations'],
            'Doc_Deliberations': ['deliberation', 'decision', 'resolution'],
            'Doc_OfficialPublication': ['official', 'publication', 'document'],
            'Doc_Source_DonBosco': ['don bosco', 'source', 'biography'],
            'Doc_Source_SalesianFamily': ['salesian family', 'source'],
            'Doc_Proceedings_SDBChapter': ['chapter', 'sdb', 'proceedings'],
            'Doc_Proceedings_FMAChapter': ['chapter', 'fma', 'proceedings'],
        }
        
        # Work Types - map keywords to work types
        work_type_keywords = {
            'Work_School': ['school', 'education', 'academic', 'student'],
            'Work_HighSchool': ['high school', 'secondary', 'college prep'],
            'Work_VocationalSchool': ['vocational', 'technical', 'training', 'skill'],
            'Work_BoardingSchool': ['boarding', 'hostel', 'residential'],
            'Work_Nurseries': ['nursery', 'kindergarten', 'preschool', 'early childhood'],
            'Work_Parish': ['parish', 'church', 'worship', 'mass'],
            'Work_ParishCatechesis': ['catechesis', 'catechism', 'religious education'],
            'Work_Oratory': ['oratory', 'youth center', 'recreation'],
            'Work_SocialWork': ['social work', 'welfare', 'community', 'service'],
            'Work_MissionsAdGentes': ['mission', 'missionary', 'evangelization'],
            'Work_HouseOfFormation': ['formation', 'seminary', 'novitiate', 'aspirantate'],
            'Work_SalesianAssociations': ['association', 'group', 'organization'],
        }
        
        # Themes - map keywords to themes
        theme_keywords = {
            'Theme_youth_ministry': ['youth', 'young people', 'adolescent', 'teenager'],
            'Theme_DonBosco': ['don bosco', 'bosco', 'saint john'],
            'Theme_SalesianFamily': ['salesian family', 'salesian'],
            'Theme_PreventiveSystem': ['preventive system', 'pedagogy', 'education'],
            'Theme_SalesianSpirituality': ['spirituality', 'spiritual', 'faith'],
            'Theme_accompaniment': ['accompaniment', 'mentor', 'guide'],
            'Theme_vocational_accompaniment': ['vocation', 'vocational', 'calling'],
            'Theme_spiritual_accompaniment': ['spiritual', 'spirituality'],
            'Theme_adolescents': ['adolescent', 'teenager', 'youth'],
            'Theme_young_people': ['young people', 'youth', 'teen'],
            'Theme_family': ['family', 'parent', 'home'],
            'Theme_loving_kindness': ['kindness', 'love', 'compassion'],
            'Theme_educational_love': ['educational love', 'pedagogy', 'education'],
        }
        
        # Areas of Reference
        area_keywords = {
            'Area_Education': ['education', 'school', 'teaching', 'learning'],
            'Area_YouthMinistry': ['youth ministry', 'youth', 'young people'],
            'Area_History': ['history', 'historical', 'past', 'heritage'],
            'Area_Spirituality': ['spirituality', 'spiritual', 'faith', 'religion'],
            'Area_Pedagogy': ['pedagogy', 'teaching', 'education', 'method'],
            'Area_ReligiousEducation': ['religious education', 'catechesis', 'faith formation'],
            'Area_Catechesis': ['catechesis', 'catechism', 'religious instruction'],
            'Area_Communication': ['communication', 'media', 'journalism', 'press'],
            'Area_Journalism': ['journalism', 'news', 'press', 'media'],
            'Area_Training': ['training', 'formation', 'development', 'course'],
            'Area_Linguistics': ['linguistics', 'language', 'translation'],
        }
        
        # Store keyword mappings for reference (not used in current implementation)
        # This can be extended for more sophisticated matching
        self.keyword_mappings = {
            'document_type': doc_type_keywords,
            'work_type': work_type_keywords,
            'theme': theme_keywords,
            'area_of_reference': area_keywords
        }
    
    def classify_page(self, text, title="", meta_description=""):
        """
        Classify a page according to the ontology
        
        Returns a dictionary with ontology-based classifications
        """
        combined_text = f"{title} {meta_description} {text}".lower()
        
        classification = {
            'document_type': None,
            'work_type': None,
            'themes': [],
            'areas_of_reference': [],
            'geo_area': None,
            'salesian_family_group': None,
            'confidence_scores': {}
        }
        
        # Score document types
        doc_type_scores = {}
        for doc_type_id, doc_type_label in self.document_types.items():
            score = self._calculate_score(combined_text, doc_type_id, doc_type_label)
            if score > 0:
                doc_type_scores[doc_type_id] = (doc_type_label, score)
        
        if doc_type_scores:
            best_doc_type = max(doc_type_scores.items(), key=lambda x: x[1][1])
            classification['document_type'] = {
                'id': best_doc_type[0],
                'label': best_doc_type[1][0],
                'confidence': best_doc_type[1][1]
            }
            classification['confidence_scores']['document_type'] = best_doc_type[1][1]
        
        # Score work types
        work_type_scores = {}
        for work_type_id, work_type_label in self.work_types.items():
            score = self._calculate_score(combined_text, work_type_id, work_type_label)
            if score > 0:
                work_type_scores[work_type_id] = (work_type_label, score)
        
        if work_type_scores:
            best_work_type = max(work_type_scores.items(), key=lambda x: x[1][1])
            classification['work_type'] = {
                'id': best_work_type[0],
                'label': best_work_type[1][0],
                'confidence': best_work_type[1][1]
            }
            classification['confidence_scores']['work_type'] = best_work_type[1][1]
        
        # Score themes (can have multiple)
        theme_scores = {}
        for theme_id, theme_label in self.themes.items():
            score = self._calculate_score(combined_text, theme_id, theme_label)
            if score > 0.3:  # Lower threshold for themes
                theme_scores[theme_id] = (theme_label, score)
        
        # Get top 3 themes
        sorted_themes = sorted(theme_scores.items(), key=lambda x: x[1][1], reverse=True)[:3]
        classification['themes'] = [
            {'id': t[0], 'label': t[1][0], 'confidence': t[1][1]}
            for t in sorted_themes
        ]
        
        # Score areas of reference (can have multiple)
        area_scores = {}
        for area_id, area_label in self.areas_of_reference.items():
            score = self._calculate_score(combined_text, area_id, area_label)
            if score > 0.3:
                area_scores[area_id] = (area_label, score)
        
        sorted_areas = sorted(area_scores.items(), key=lambda x: x[1][1], reverse=True)[:3]
        classification['areas_of_reference'] = [
            {'id': a[0], 'label': a[1][0], 'confidence': a[1][1]}
            for a in sorted_areas
        ]
        
        # Score geo areas
        geo_scores = {}
        for geo_id, geo_label in self.geo_areas.items():
            score = self._calculate_score(combined_text, geo_id, geo_label)
            if score > 0:
                geo_scores[geo_id] = (geo_label, score)
        
        if geo_scores:
            best_geo = max(geo_scores.items(), key=lambda x: x[1][1])
            classification['geo_area'] = {
                'id': best_geo[0],
                'label': best_geo[1][0],
                'confidence': best_geo[1][1]
            }
        
        # Score Salesian Family Groups
        family_scores = {}
        for family_id, family_label in self.salesian_family_groups.items():
            score = self._calculate_score(combined_text, family_id, family_label)
            if score > 0:
                family_scores[family_id] = (family_label, score)
        
        if family_scores:
            best_family = max(family_scores.items(), key=lambda x: x[1][1])
            classification['salesian_family_group'] = {
                'id': best_family[0],
                'label': best_family[1][0],
                'confidence': best_family[1][1]
            }
        
        return classification
    
    def _calculate_score(self, text, entity_id, entity_label):
        """Calculate relevance score for an entity"""
        import re
        
        score = 0.0
        
        # Check for entity ID keywords (without prefix)
        id_keywords = entity_id.replace('_', ' ').lower().split()
        for keyword in id_keywords:
            if len(keyword) > 3:  # Skip short words
                matches = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text))
                score += matches * 0.5
        
        # Check for label keywords
        label_keywords = entity_label.lower().split()
        for keyword in label_keywords:
            if len(keyword) > 3:
                matches = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text))
                score += matches * 1.0
        
        # Normalize score (simple normalization)
        if score > 0:
            score = min(score / 10.0, 1.0)  # Cap at 1.0
        
        return score
    
    def get_all_categories(self):
        """Get all categories organized by type"""
        return {
            'document_types': self.document_types,
            'work_types': self.work_types,
            'themes': self.themes,
            'areas_of_reference': self.areas_of_reference,
            'geo_areas': self.geo_areas,
            'salesian_family_groups': self.salesian_family_groups
        }

