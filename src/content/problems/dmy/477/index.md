---
oj: dmy
pid: '477'
title: '[R77C] 文件'
difficulty: 普及
tags:
  - 栈
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，每个编号在序列 $a$ 中恰好出现两次。

## 思路

朴素做法是用一个数组从底到顶维护文件堆：第一次出现时压入末尾，第二次出现时需要在线性时间内找到并删除它，总复杂度 $O(n^2)$，只能过 $n \le 5000$ 的子任务。

注意到「取出中间的文件」这个操作可以**延迟**：不必立刻移动其他元素，只把该文件标记为已取出。于是仍然用一个栈按第一次出现的顺序记录文件，但栈中允许存在已经被取出、尚未清理的「无效」元素。

处理编号 $x$ 的第二次出现时：

1. 由于每轮结束都会清理栈顶的无效元素，此时栈顶要么为空，要么是一个仍在文件堆中的文件，也就是文件堆真实的顶部。若栈顶恰好为 $x$，则这是一次无遮挡取件，答案加一。
2. 把 $x$ 标记为已取出（此时它可能不在栈顶，而是被埋在中间）。
3. 不断弹出栈顶已被取出的元素，直到栈空或栈顶仍在文件堆中。

被埋在中间的无效文件不会影响「堆顶是谁」这一判断：等它上方的文件全部取出后它才会升到栈顶，那时再清理即可。

## 复杂度

每个编号至多入栈一次、出栈一次，因此时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let k = 2 * n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    let seen = Array<Bool>(nn + 1, { _ => false })
    let taken = Array<Bool>(nn + 1, { _ => false })
    let stk = Array<Int64>(k + 1, { _ => 0 })
    var sp: Int64 = 0
    var ans: Int64 = 0

    for (i in 0..k) {
        let x = a[i]
        if (!seen[x]) {
            seen[x] = true
            stk[sp] = x
            sp += 1
        } else {
            if (sp > 0 && stk[sp - 1] == x) {
                ans += 1
            }
            taken[x] = true
            while (sp > 0 && taken[stk[sp - 1]]) {
                sp -= 1
            }
        }
    }

    println(ans)
}
```
