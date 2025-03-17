'use client';

import { Box, Button, Container, Flex, Heading, SimpleGrid, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} minH="100vh">
      {/* 헤더 섹션 */}
      <Container maxW="container.xl" pt={10}>
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          align="center" 
          justify="space-between"
          py={8}
          gap={8}
        >
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={6} flex={1}>
            <Heading 
              as="h1" 
              size="2xl" 
              fontWeight="bold"
              lineHeight="1.2"
            >
              산업 현장의 안전과 <br />
              효율성을 높이는 <br />
              <Text as="span" color="blue.500">종합 관리 플랫폼</Text>
            </Heading>
            
            <Text fontSize="xl" color="gray.600" maxW="540px">
              위험성 평가, AI 챗봇, 안전 문서 관리, 근로자 관리까지 
              산업 현장의 모든 안전 요소를 한 곳에서 관리하세요.
            </Text>
            
            <Flex gap={4} mt={4}>
              <Button 
                size="lg" 
                colorScheme="blue" 
                rounded="full"
              >
                무료로 시작하기
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                rounded="full"
              >
                서비스 둘러보기
              </Button>
            </Flex>
          </VStack>
          
          <Box
            w={{ base: "100%", md: "50%" }}
            h={{ base: "300px", md: "400px" }}
            position="relative"
            borderRadius="xl"
            overflow="hidden"
          >
            {/* 여기에 메인 이미지를 넣을 수 있습니다 */}
            <Box
              bg="blue.500"
              w="100%"
              h="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="xl"
              fontWeight="bold"
            >
              산업 안전 관리 플랫폼 이미지
            </Box>
          </Box>
        </Flex>
      </Container>

      {/* 주요 기능 섹션 */}
      <Box py={16} bg={useColorModeValue('white', 'gray.800')}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" size="xl">주요 기능</Heading>
              <Text fontSize="lg" color="gray.600" maxW="800px">
                산업 현장의 안전과 효율성을 향상시키는 다양한 기능을 제공합니다
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
              {[
                { title: '위험성 평가', desc: 'GPT API를 활용한 지능적인 위험성 평가 시스템' },
                { title: 'AI 챗봇', desc: '안전 관련 질문에 즉시 답변하는 AI 지원 챗봇' },
                { title: '문서 관리', desc: '안전 문서를 체계적으로 관리하고 공유하는 시스템' },
                { title: '근로자 관리', desc: '근로자 교육, 출입 관리를 위한 종합 관리 기능' },
              ].map((feature, idx) => (
                <Box
                  key={idx}
                  bg={cardBgColor}
                  p={6}
                  borderRadius="lg"
                  boxShadow="md"
                  textAlign="center"
                >
                  <VStack spacing={4}>
                    <Box
                      w="60px"
                      h="60px"
                      borderRadius="full"
                      bg="blue.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="blue.500"
                      fontSize="2xl"
                    >
                      {idx + 1}
                    </Box>
                    <Heading as="h3" size="md">{feature.title}</Heading>
                    <Text color="gray.600">{feature.desc}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 푸터 */}
      <Box as="footer" py={10} bg={useColorModeValue('gray.100', 'gray.900')}>
        <Container maxW="container.xl">
          <Text textAlign="center" color="gray.600">
            © 2025 산업 안전 관리 플랫폼. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
